import { Injectable, Logger } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { type InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxItemTypeService } from 'src/engine/core-modules/inbox/services/inbox-item-type.service';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import {
  type InboxSubject,
  type RouteInboxItemArgs,
} from 'src/engine/core-modules/inbox/types/route-inbox-item.type';
import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

// The producers' side of the item. Everything here reports that something
// happened; nothing here decides whether the assignee is done with it.
@Injectable()
export class InboxRouterService {
  private readonly logger = new Logger(InboxRouterService.name);

  constructor(
    @InjectWorkspaceScopedRepository(InboxItemEntity)
    private readonly inboxItemRepository: WorkspaceScopedRepository<InboxItemEntity>,
    private readonly inboxItemTypeService: InboxItemTypeService,
    private readonly inboxQueueService: InboxQueueService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  // The flag gates what accrues: creating items and seeding types. Updates to
  // items that already exist stay ungated, so archiving a thread while the flag
  // is off cannot leave a stale item to resurface when it is turned back on.
  private async isInboxEnabled(workspaceId: string): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_INBOX_ENABLED,
      workspaceId,
    );
  }

  // Routing never breaks the caller: a producer that cannot notify should still
  // complete its own work.
  async route(args: RouteInboxItemArgs): Promise<InboxItemEntity | null> {
    try {
      if (!(await this.isInboxEnabled(args.workspaceId))) {
        return null;
      }

      return await this.routeItem(args);
    } catch (error) {
      this.logger.warn(
        `Failed to route inbox item of type ${args.typeKey} in workspace ${
          args.workspaceId
        }: ${error instanceof Error ? error.message : String(error)}`,
      );

      return null;
    }
  }

  async routeItem(args: RouteInboxItemArgs): Promise<InboxItemEntity | null> {
    const inboxItemType = await this.inboxItemTypeService.findByKey({
      workspaceId: args.workspaceId,
      key: args.typeKey,
    });

    if (!isDefined(inboxItemType)) {
      throw new InboxException(
        `Unknown inbox item type ${args.typeKey}`,
        InboxExceptionCode.UNKNOWN_INBOX_ITEM_TYPE,
      );
    }

    return this.upsertItem({
      args,
      inboxItemType,
      address: await this.resolveAddress(args),
      // One item per subject for the subject's whole life, unless the producer
      // knows better and names its own slot. A producer whose events are each
      // separate work names no slot and gets an item per call.
      slotKey: args.slotKey ?? this.resolveSubjectKey(args.subject),
    });
  }

  // Where routing policy lives. Rules are code today; a workspace-configurable
  // rule set plugs in here without touching producers.
  //
  // Anything it cannot address goes to the triage queue rather than nowhere. A
  // producer that reports work is entitled to assume the work landed.
  private async resolveAddress(
    args: RouteInboxItemArgs,
  ): Promise<InboxItemAddress> {
    if (args.subject?.kind === 'thread') {
      return {
        kind: 'person',
        assigneeUserWorkspaceId: args.subject.ownerUserWorkspaceId,
      };
    }

    if (args.target?.kind === 'userWorkspace') {
      return {
        kind: 'person',
        assigneeUserWorkspaceId: args.target.userWorkspaceId,
      };
    }

    if (args.target?.kind === 'queue') {
      return { kind: 'queue', queueId: args.target.queueId };
    }

    const defaultQueue = await this.inboxQueueService.findOrCreateDefaultQueue({
      workspaceId: args.workspaceId,
    });

    return { kind: 'queue', queueId: defaultQueue.id };
  }

  private resolveSubjectKey(subject?: InboxSubject): string | null {
    return isDefined(subject) ? buildSubjectKey(subject) : null;
  }

  private async upsertItem({
    args,
    inboxItemType,
    address,
    slotKey,
  }: {
    args: RouteInboxItemArgs;
    inboxItemType: InboxItemTypeEntity;
    address: InboxItemAddress;
    slotKey: string | null;
  }): Promise<InboxItemEntity | null> {
    const existingItem = isDefined(slotKey)
      ? await this.findItemInSlot({
          workspaceId: args.workspaceId,
          address,
          slotKey,
        })
      : null;

    if (isDefined(existingItem)) {
      return this.foldIntoItem({ existingItem, args, inboxItemType });
    }

    try {
      return await this.insertItem({
        args,
        inboxItemType,
        address,
        slotKey,
      });
    } catch (error) {
      const isConcurrentInsert =
        typeof error === 'object' &&
        isDefined(error) &&
        (error as { code?: string }).code ===
          POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION;

      if (!isConcurrentInsert || !isDefined(slotKey)) {
        throw error;
      }

      // Another producer won the race for this slot; fold into its item.
      const concurrentItem = await this.findItemInSlot({
        workspaceId: args.workspaceId,
        address,
        slotKey,
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

  // At most one row can hold a slot in one inbox, so there is nothing to
  // disambiguate: a cleared item is the same item, waiting for its next event.
  // A queue's slot is looked up by the queue, never by who currently holds it,
  // so taking an item cannot split its slot in two.
  private async findItemInSlot({
    workspaceId,
    address,
    slotKey,
  }: {
    workspaceId: string;
    address: InboxItemAddress;
    slotKey: string;
  }): Promise<InboxItemEntity | null> {
    return this.inboxItemRepository.findOne(workspaceId, {
      where:
        address.kind === 'queue'
          ? { queueId: address.queueId, slotKey }
          : {
              queueId: IsNull(),
              assigneeUserWorkspaceId: address.assigneeUserWorkspaceId,
              slotKey,
            },
    });
  }

  // A new event on an item that was already cleared brings it back on its own:
  // lastEventAt moves past clearedAt and every read agrees it wants attention
  // again. Nothing here has to undo what the assignee did.
  //
  // The timestamp is the database's, not this process's. What matters is which
  // of the two writes reached Postgres last, and app servers do not share a
  // clock with it or with each other.
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
        lastEventAt: () => 'clock_timestamp()',
        version: () => '"version" + 1',
      },
    );

    return this.inboxItemRepository.findOneBy(args.workspaceId, {
      id: existingItem.id,
    });
  }

  private async insertItem({
    args,
    inboxItemType,
    address,
    slotKey,
  }: {
    args: RouteInboxItemArgs;
    inboxItemType: InboxItemTypeEntity;
    address: InboxItemAddress;
    slotKey: string | null;
  }): Promise<InboxItemEntity> {
    return this.inboxItemRepository.save(args.workspaceId, {
      inboxItemTypeId: inboxItemType.id,
      priority: args.priority ?? inboxItemType.defaultPriority,
      title: args.title ?? inboxItemType.label,
      preview: args.preview ?? null,
      payload: args.payload ?? null,
      queueId: address.kind === 'queue' ? address.queueId : null,
      assigneeUserWorkspaceId:
        address.kind === 'person' ? address.assigneeUserWorkspaceId : null,
      slotKey,
      threadId: args.subject?.kind === 'thread' ? args.subject.threadId : null,
      subjectObjectMetadataId:
        args.subject?.kind === 'record' ? args.subject.objectMetadataId : null,
      subjectRecordId:
        args.subject?.kind === 'record' ? args.subject.recordId : null,
    });
  }

  // A rename is not something that happened to the subject, so it leaves
  // lastEventAt alone: the item keeps its place in the list, a cleared one
  // stays cleared and a read one stays read.
  async renameThreadItem({
    workspaceId,
    threadId,
    title,
  }: {
    workspaceId: string;
    threadId: string;
    title: string;
  }): Promise<void> {
    await this.runBestEffort('renameThreadItem', workspaceId, async () => {
      await this.inboxItemRepository.update(
        workspaceId,
        { threadId },
        { title },
      );
    });
  }

  // The subject is gone, so nothing will ever bring this back. Cleared by
  // nobody, which is how a disappearance is told apart from someone's decision.
  async clearByThreadId({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    await this.runBestEffort('clearByThreadId', workspaceId, async () => {
      await this.inboxItemRepository.update(
        workspaceId,
        { threadId },
        {
          clearedAt: () => 'clock_timestamp()',
          clearedByUserWorkspaceId: null,
          resurfaceAt: null,
          // Bumped so an action opened before the thread went away loses
          version: () => '"version" + 1',
        },
      );
    });
  }

  // The inbox is never allowed to fail the subsystem that feeds it: a chat or
  // workflow operation must complete even when its inbox item cannot.
  private async runBestEffort(
    operation: string,
    workspaceId: string,
    run: () => Promise<unknown>,
  ): Promise<void> {
    try {
      await run();
    } catch (error) {
      this.logger.warn(
        `Failed to ${operation} in workspace ${workspaceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

// Which inbox a producer addressed an item to. One or the other, never
// neither: an item only gains both when someone takes it out of a queue.
type InboxItemAddress =
  | { kind: 'queue'; queueId: string }
  | { kind: 'person'; assigneeUserWorkspaceId: string };

export const buildSubjectKey = (subject: InboxSubject): string =>
  subject.kind === 'thread'
    ? `thread:${subject.threadId}`
    : `record:${subject.objectMetadataId}:${subject.recordId}`;
