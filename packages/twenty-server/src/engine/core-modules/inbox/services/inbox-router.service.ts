import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { type InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { InboxItemBinding } from 'src/engine/core-modules/inbox/enums/inbox-item-binding.enum';
import { InboxItemStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-status.enum';
import { InboxItemTypeService } from 'src/engine/core-modules/inbox/services/inbox-item-type.service';
import {
  type InboxSubject,
  type RouteInboxItemArgs,
} from 'src/engine/core-modules/inbox/types/route-inbox-item.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const POSTGRES_UNIQUE_VIOLATION = '23505';

@Injectable()
export class InboxRouterService {
  private readonly logger = new Logger(InboxRouterService.name);

  constructor(
    @InjectWorkspaceScopedRepository(InboxItemEntity)
    private readonly inboxItemRepository: WorkspaceScopedRepository<InboxItemEntity>,
    private readonly inboxItemTypeService: InboxItemTypeService,
  ) {}

  // Routing never breaks the caller: a producer that cannot notify should still
  // complete its own work.
  async route(args: RouteInboxItemArgs): Promise<InboxItemEntity | null> {
    try {
      return await this.routeOrThrow(args);
    } catch (error) {
      this.logger.warn(
        `Failed to route inbox item of type ${args.typeKey} in workspace ${
          args.workspaceId
        }: ${error instanceof Error ? error.message : String(error)}`,
      );

      return null;
    }
  }

  async routeOrThrow(
    args: RouteInboxItemArgs,
  ): Promise<InboxItemEntity | null> {
    const inboxItemType = await this.inboxItemTypeService.findByKey({
      workspaceId: args.workspaceId,
      key: args.typeKey,
    });

    if (!isDefined(inboxItemType)) {
      throw new Error(`Unknown inbox item type ${args.typeKey}`);
    }

    const assigneeUserWorkspaceId = this.resolveAssignee(args);

    if (!isDefined(assigneeUserWorkspaceId)) {
      return null;
    }

    const dedupeKey = this.resolveDedupeKey({ args, inboxItemType });

    if (
      inboxItemType.binding === InboxItemBinding.SUBJECT &&
      !isDefined(dedupeKey)
    ) {
      throw new Error(
        `Inbox item type ${args.typeKey} is subject bound and needs a subject`,
      );
    }

    return this.upsertItem({
      args,
      inboxItemType,
      assigneeUserWorkspaceId,
      dedupeKey,
    });
  }

  // Where routing policy lives. Rules are code today; a workspace-configurable
  // rule set plugs in here without touching producers.
  private resolveAssignee(args: RouteInboxItemArgs): string | null {
    if (args.subject?.kind === 'thread') {
      return args.subject.ownerUserWorkspaceId;
    }

    return args.fallbackAssigneeUserWorkspaceId ?? null;
  }

  private resolveDedupeKey({
    args,
    inboxItemType,
  }: {
    args: RouteInboxItemArgs;
    inboxItemType: InboxItemTypeEntity;
  }): string | null {
    if (isDefined(args.dedupeKey)) {
      return args.dedupeKey;
    }

    if (inboxItemType.binding === InboxItemBinding.OCCURRENCE) {
      return null;
    }

    return isDefined(args.subject) ? buildSubjectKey(args.subject) : null;
  }

  private async upsertItem({
    args,
    inboxItemType,
    assigneeUserWorkspaceId,
    dedupeKey,
  }: {
    args: RouteInboxItemArgs;
    inboxItemType: InboxItemTypeEntity;
    assigneeUserWorkspaceId: string;
    dedupeKey: string | null;
  }): Promise<InboxItemEntity | null> {
    const existingItem = isDefined(dedupeKey)
      ? await this.findFoldableItem({
          workspaceId: args.workspaceId,
          assigneeUserWorkspaceId,
          dedupeKey,
          binding: inboxItemType.binding,
        })
      : null;

    if (isDefined(existingItem)) {
      return this.foldIntoItem({ existingItem, args, inboxItemType });
    }

    try {
      return await this.insertItem({
        args,
        inboxItemType,
        assigneeUserWorkspaceId,
        dedupeKey,
      });
    } catch (error) {
      const isConcurrentInsert =
        typeof error === 'object' &&
        isDefined(error) &&
        (error as { code?: string }).code === POSTGRES_UNIQUE_VIOLATION;

      if (!isConcurrentInsert || !isDefined(dedupeKey)) {
        throw error;
      }

      // Another producer won the race for this key; fold into its item.
      const concurrentItem = await this.findFoldableItem({
        workspaceId: args.workspaceId,
        assigneeUserWorkspaceId,
        dedupeKey,
        binding: inboxItemType.binding,
      });

      if (!isDefined(concurrentItem)) {
        throw error;
      }

      return this.foldIntoItem({
        existingItem: concurrentItem,
        args,
        inboxItemType,
      });
    }
  }

  // A subject keeps one item across its whole life, so a resolved one is
  // revived rather than duplicated. An occurrence only folds while still open.
  private async findFoldableItem({
    workspaceId,
    assigneeUserWorkspaceId,
    dedupeKey,
    binding,
  }: {
    workspaceId: string;
    assigneeUserWorkspaceId: string;
    dedupeKey: string;
    binding: InboxItemBinding;
  }): Promise<InboxItemEntity | null> {
    const openItem = await this.inboxItemRepository.findOne(workspaceId, {
      where: {
        assigneeUserWorkspaceId,
        dedupeKey,
        status: InboxItemStatus.OPEN,
      },
      order: { updatedAt: 'DESC' },
    });

    if (isDefined(openItem) || binding === InboxItemBinding.OCCURRENCE) {
      return openItem;
    }

    // Only reached for a subject with no open item left. Reviving a resolved
    // one while an open one still holds the key would collide on
    // IDX_INBOX_ITEM_DEDUPE_KEY_OPEN_UNIQUE, so the open row always wins.
    return this.inboxItemRepository.findOne(workspaceId, {
      where: { assigneeUserWorkspaceId, dedupeKey },
      order: { updatedAt: 'DESC' },
    });
  }

  private async foldIntoItem({
    existingItem,
    args,
    inboxItemType,
  }: {
    existingItem: InboxItemEntity;
    args: RouteInboxItemArgs;
    inboxItemType: InboxItemTypeEntity;
  }): Promise<InboxItemEntity | null> {
    await this.inboxItemRepository.update(
      args.workspaceId,
      { id: existingItem.id },
      {
        inboxItemTypeId: inboxItemType.id,
        priority: args.priority ?? inboxItemType.defaultPriority,
        ...(isDefined(args.title) ? { title: args.title } : {}),
        ...(isDefined(args.preview) ? { preview: args.preview } : {}),
        ...(isDefined(args.payload) ? { payload: args.payload } : {}),
        status: InboxItemStatus.OPEN,
        // New activity resurfaces a snoozed item and makes it unread again
        snoozedUntil: null,
        readAt: null,
        resolvedAt: null,
        resolvedByUserWorkspaceId: null,
      },
    );

    return this.inboxItemRepository.findOneBy(args.workspaceId, {
      id: existingItem.id,
    });
  }

  private async insertItem({
    args,
    inboxItemType,
    assigneeUserWorkspaceId,
    dedupeKey,
  }: {
    args: RouteInboxItemArgs;
    inboxItemType: InboxItemTypeEntity;
    assigneeUserWorkspaceId: string;
    dedupeKey: string | null;
  }): Promise<InboxItemEntity> {
    return this.inboxItemRepository.save(args.workspaceId, {
      inboxItemTypeId: inboxItemType.id,
      status: InboxItemStatus.OPEN,
      priority: args.priority ?? inboxItemType.defaultPriority,
      title: args.title ?? inboxItemType.label,
      preview: args.preview ?? null,
      payload: args.payload ?? null,
      assigneeUserWorkspaceId,
      dedupeKey,
      threadId: args.subject?.kind === 'thread' ? args.subject.threadId : null,
      subjectObjectMetadataId:
        args.subject?.kind === 'record' ? args.subject.objectMetadataId : null,
      subjectRecordId:
        args.subject?.kind === 'record' ? args.subject.recordId : null,
    });
  }

  // A rename is not new activity: it retitles the item in place and touches
  // nothing else, so a read, snoozed or resolved item stays exactly as it was.
  // Resolved items keep their title in sync too, so the retitle is not scoped
  // to open ones.
  async renameThreadItem({
    workspaceId,
    threadId,
    title,
  }: {
    workspaceId: string;
    threadId: string;
    title: string;
  }): Promise<void> {
    await this.inboxItemRepository.update(workspaceId, { threadId }, { title });
  }

  async dismissByThreadId({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    await this.inboxItemRepository.update(
      workspaceId,
      { threadId, status: InboxItemStatus.OPEN },
      { status: InboxItemStatus.DISMISSED, resolvedAt: new Date() },
    );
  }
}

export const buildSubjectKey = (subject: InboxSubject): string =>
  subject.kind === 'thread'
    ? `thread:${subject.threadId}`
    : `record:${subject.objectMetadataId}:${subject.recordId}`;
