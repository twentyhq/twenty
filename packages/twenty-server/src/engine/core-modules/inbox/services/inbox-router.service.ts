import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource, type EntityManager, IsNull } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';
import { type InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxItemTypeService } from 'src/engine/core-modules/inbox/services/inbox-item-type.service';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import { type InboxItemToolCallDraft } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-draft.type';
import {
  type InboxSubject,
  type RouteInboxItemArgs,
} from 'src/engine/core-modules/inbox/types/route-inbox-item.type';
import { buildClaimableToolCallPredicate } from 'src/engine/core-modules/inbox/utils/inbox-tool-call-claim.util';
import { isUniqueViolation } from 'src/engine/core-modules/inbox/utils/is-unique-violation.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

// The producers' side of the item. Everything here reports that something
// happened; nothing here decides whether the assignee is done with it.
@Injectable()
export class InboxRouterService {
  private readonly logger = new Logger(InboxRouterService.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectWorkspaceScopedRepository(InboxItemEntity)
    private readonly inboxItemRepository: WorkspaceScopedRepository<InboxItemEntity>,
    @InjectWorkspaceScopedRepository(InboxItemToolCallEntity)
    private readonly inboxItemToolCallRepository: WorkspaceScopedRepository<InboxItemToolCallEntity>,
    private readonly inboxItemTypeService: InboxItemTypeService,
    private readonly inboxQueueService: InboxQueueService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly userWorkspaceService: UserWorkspaceService,
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
    return this.bestEffort(
      `route inbox item of type ${args.typeKey}`,
      args.workspaceId,
      async () => {
        if (!(await this.isInboxEnabled(args.workspaceId))) {
          return null;
        }

        return this.routeItem(args);
      },
    );
  }

  // For callers whose whole purpose was the item: a workflow step that creates
  // one has nothing else to complete, so it wants the failure, not a quiet null.
  async routeOrThrow(args: RouteInboxItemArgs): Promise<InboxItemEntity> {
    if (!(await this.isInboxEnabled(args.workspaceId))) {
      throw new InboxException(
        'The inbox is not enabled for this workspace',
        InboxExceptionCode.INBOX_DISABLED,
      );
    }

    const item = await this.routeItem(args);

    if (!isDefined(item)) {
      throw new InboxException(
        `Failed to route inbox item of type ${args.typeKey}`,
        InboxExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    return item;
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
      address: await this.resolveAddress(args, inboxItemType),
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
    inboxItemType: InboxItemTypeEntity,
  ): Promise<InboxItemAddress> {
    if (isDefined(args.subject?.ownerUserWorkspaceId)) {
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

    // What the workspace configured for this kind of work, before falling back
    // to the queue that catches everything nothing else claimed.
    if (isDefined(inboxItemType.defaultQueueId)) {
      return { kind: 'queue', queueId: inboxItemType.defaultQueueId };
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
      if (!isUniqueViolation(error) || !isDefined(slotKey)) {
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
    // One transaction for the event and the plan it carries, with the item
    // locked first, so two plans folding at once take turns and neither can
    // leave the event recorded without its calls
    return this.coreDataSource.transaction(async (manager) => {
      const inboxItemRepository = this.inboxItemRepository.withManager(manager);

      const lockedItem = await inboxItemRepository.findOne(args.workspaceId, {
        where: { id: existingItem.id },
        lock: { mode: 'pessimistic_write' },
      });

      // Gone between the slot lookup and the lock: the event has nowhere to
      // land, and saying so beats a silent no-op that loses it
      if (!isDefined(lockedItem)) {
        throw new InboxException(
          `Inbox item ${existingItem.id} went away while an event was folding into it`,
          InboxExceptionCode.INBOX_ITEM_NOT_FOUND,
        );
      }

      await inboxItemRepository.update(
        args.workspaceId,
        { id: existingItem.id },
        {
          inboxItemTypeId: inboxItemType.id,
          priority: args.priority ?? inboxItemType.defaultPriority,
          ...(isDefined(args.title) ? { title: args.title } : {}),
          ...(isDefined(args.context) ? { context: args.context } : {}),
          lastEventAt: () => 'clock_timestamp()',
          version: () => '"version" + 1',
        },
      );

      if (isDefined(args.toolCalls)) {
        await this.replaceProposedToolCalls({
          manager,
          workspaceId: args.workspaceId,
          inboxItemId: existingItem.id,
          toolCalls: args.toolCalls,
        });
      }

      // Postgres holds the row lock taken above until this transaction
      // commits, so no cascade can delete the row before this read. Reading
      // after the commit could, and a null there reads as a failed fold to
      // the producer even though its event landed.
      return inboxItemRepository.findOneBy(args.workspaceId, {
        id: existingItem.id,
      });
    });
  }

  // A new plan for the same slot replaces what was still proposed and nobody
  // holds, and leaves what already ran, was skipped, or is running right now,
  // so the item keeps its history and a call in flight finishes on its row.
  private async replaceProposedToolCalls({
    manager,
    workspaceId,
    inboxItemId,
    toolCalls,
  }: {
    manager: EntityManager;
    workspaceId: string;
    inboxItemId: string;
    toolCalls: InboxItemToolCallDraft[];
  }): Promise<void> {
    const toolCallRepository =
      this.inboxItemToolCallRepository.withManager(manager);

    await toolCallRepository.delete(workspaceId, {
      inboxItemId,
      ...buildClaimableToolCallPredicate(),
    });

    const keptToolCalls = await toolCallRepository.find(workspaceId, {
      where: { inboxItemId },
      select: { position: true },
    });
    const firstPosition = keptToolCalls.reduce(
      (max, toolCall) => Math.max(max, toolCall.position + 1),
      0,
    );

    await this.insertToolCalls({
      manager,
      workspaceId,
      inboxItemId,
      toolCalls,
      firstPosition,
    });
  }

  private async insertToolCalls({
    manager,
    workspaceId,
    inboxItemId,
    toolCalls,
    firstPosition,
  }: {
    manager: EntityManager;
    workspaceId: string;
    inboxItemId: string;
    toolCalls: InboxItemToolCallDraft[];
    firstPosition: number;
  }): Promise<void> {
    if (toolCalls.length === 0) {
      return;
    }

    await this.inboxItemToolCallRepository.withManager(manager).insert(
      workspaceId,
      toolCalls.map((toolCall, index) => ({
        inboxItemId,
        position: firstPosition + index,
        toolName: toolCall.toolName,
        label: toolCall.label,
        description: toolCall.description ?? null,
        icon: toolCall.icon ?? null,
        inputSchema: toolCall.inputSchema ?? [],
        proposedInput: toolCall.proposedInput,
      })),
    );
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
    // The item and its calls land together: a plan that lost its rows on the
    // way in would read as nothing to do and could be marked done as such
    return this.coreDataSource.transaction(async (manager) => {
      const inboxItem = await this.inboxItemRepository
        .withManager(manager)
        .insertAndReturnOne(args.workspaceId, {
          inboxItemTypeId: inboxItemType.id,
          priority: args.priority ?? inboxItemType.defaultPriority,
          title: args.title ?? inboxItemType.label,
          context: args.context ?? {},
          queueId: address.kind === 'queue' ? address.queueId : null,
          assigneeUserWorkspaceId:
            address.kind === 'person' ? address.assigneeUserWorkspaceId : null,
          slotKey,
          threadId:
            args.subject?.kind === 'thread' ? args.subject.threadId : null,
          subjectObjectMetadataId:
            args.subject?.kind === 'record'
              ? args.subject.objectMetadataId
              : null,
          subjectRecordId:
            args.subject?.kind === 'record' ? args.subject.recordId : null,
        });

      await this.insertToolCalls({
        manager,
        workspaceId: args.workspaceId,
        inboxItemId: inboxItem.id,
        toolCalls: args.toolCalls ?? [],
        firstPosition: 0,
      });

      return inboxItem;
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
    await this.bestEffort('rename the thread item', workspaceId, async () => {
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
    await this.bestEffort('clear the thread items', workspaceId, async () => {
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

  // Producers name a workspace member because that is the identity they can
  // see; the inbox addresses the user workspace behind it. Assigning is
  // routing, not access, so the translation lives with routing.
  async toUserWorkspaceId({
    workspaceId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
  }): Promise<string | null> {
    const workspaceMember = await this.userWorkspaceService.getWorkspaceMember({
      workspaceMemberId,
      workspaceId,
    });

    if (!isDefined(workspaceMember?.userId)) {
      return null;
    }

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUser({
        userId: workspaceMember.userId,
        workspaceId,
        relations: [],
      });

    return userWorkspace?.id ?? null;
  }

  // The inbox is never allowed to fail the subsystem that feeds it: a chat or
  // workflow operation must complete even when its inbox item cannot. This is
  // the one place that decides so, so every producer reads the same way.
  private async bestEffort<TResult>(
    operation: string,
    workspaceId: string,
    run: () => Promise<TResult | null>,
  ): Promise<TResult | null> {
    try {
      return await run();
    } catch (error) {
      this.logger.warn(
        `Failed to ${operation} in workspace ${workspaceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
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
