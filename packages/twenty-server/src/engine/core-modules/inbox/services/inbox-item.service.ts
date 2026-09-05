import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, In, IsNull, Not } from 'typeorm';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxItemScope } from 'src/engine/core-modules/inbox/enums/inbox-item-scope.enum';
import { InboxQueueAssignment } from 'src/engine/core-modules/inbox/enums/inbox-queue-assignment.enum';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import {
  buildInboxItemScopeCriteria,
  buildInboxItemUnreadCriteria,
} from 'src/engine/core-modules/inbox/utils/inbox-item-scope.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export const DEFAULT_INBOX_PAGE_SIZE = 50;
export const MAX_INBOX_PAGE_SIZE = 100;

// A queue is read through an assignment filter, because "everything addressed
// here" and "what nobody has picked up" are different questions.
export type InboxReadScope =
  | { kind: 'personal' }
  | {
      kind: 'queue';
      queueId: string;
      assignment: InboxQueueAssignment;
    };

@Injectable()
export class InboxItemService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxItemEntity)
    private readonly inboxItemRepository: WorkspaceScopedRepository<InboxItemEntity>,
  ) {}

  // The caller supplies `now` so that selecting a scope and reporting a scope
  // use the same instant, and a resurfacing time cannot elapse mid request.
  async findMany({
    workspaceId,
    actorUserWorkspaceId,
    readScope,
    scope,
    now,
    limit,
  }: {
    workspaceId: string;
    actorUserWorkspaceId: string;
    readScope: InboxReadScope;
    scope: InboxItemScope;
    now: Date;
    limit?: number;
  }): Promise<InboxItemEntity[]> {
    return this.inboxItemRepository.find(workspaceId, {
      where: {
        ...this.buildReadScopeCriteria({ readScope, actorUserWorkspaceId }),
        ...buildInboxItemScopeCriteria(scope, now),
      },
      relations: { inboxItemType: true, toolCalls: true },
      order: { lastEventAt: 'DESC' },
      // A non positive take reaches Postgres as "no limit", so the cap is
      // clamped at both ends rather than only at the top.
      take: Math.max(
        1,
        Math.min(limit ?? DEFAULT_INBOX_PAGE_SIZE, MAX_INBOX_PAGE_SIZE),
      ),
    });
  }

  async countByScope({
    workspaceId,
    actorUserWorkspaceId,
    readScope,
    now,
    shouldCountSnoozed = true,
  }: {
    workspaceId: string;
    actorUserWorkspaceId: string;
    readScope: InboxReadScope;
    now: Date;
    // The snoozed count is the most expensive of the three and a queue badge
    // does not show it, so it is not computed unless asked for.
    shouldCountSnoozed?: boolean;
  }): Promise<{ unread: number; needsAction: number; snoozed: number }> {
    const readScopeCriteria = this.buildReadScopeCriteria({
      readScope,
      actorUserWorkspaceId,
    });
    const visibleCriteria = {
      ...readScopeCriteria,
      ...buildInboxItemScopeCriteria(InboxItemScope.INBOX, now),
    };

    const [unread, needsAction, snoozed = 0] = await Promise.all([
      this.inboxItemRepository.count(workspaceId, {
        where: { ...visibleCriteria, ...buildInboxItemUnreadCriteria() },
      }),
      this.inboxItemRepository.count(workspaceId, {
        where: { ...visibleCriteria, priority: InboxItemPriority.NEEDS_ACTION },
      }),
      ...(shouldCountSnoozed
        ? [
            this.inboxItemRepository.count(workspaceId, {
              where: {
                ...readScopeCriteria,
                ...buildInboxItemScopeCriteria(InboxItemScope.SNOOZED, now),
              },
            }),
          ]
        : []),
    ]);

    return { unread, needsAction, snoozed };
  }

  // Reading an item is not activity on it: it moves nothing and bumps no
  // version, so the list stays ordered by lastEventAt.
  async markRead({
    inboxItemId,
    workspaceId,
    actorUserWorkspaceId,
    accessibleQueueIds,
  }: VisibleItemArgs): Promise<InboxItemEntity> {
    const inboxItem = await this.findVisibleItemOrThrow({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
    });

    const updateResult = await this.inboxItemRepository.update(
      workspaceId,
      this.buildWriteScope({
        inboxItem,
        actorUserWorkspaceId,
        accessibleQueueIds,
      }),
      // Database clock, since unread is this against lastEventAt.
      { readAt: () => 'clock_timestamp()' },
    );

    if (updateResult.affected === 0) {
      throw new InboxException(
        `Inbox item ${inboxItemId} changed since it was read`,
        InboxExceptionCode.INBOX_ITEM_CHANGED,
      );
    }

    return this.findVisibleItemOrThrow({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
    });
  }

  // Visible means addressed to you, or sitting in a queue you watch, which is
  // the only thing keeping one team out of another's inbox.
  async findVisibleItem({
    inboxItemId,
    workspaceId,
    actorUserWorkspaceId,
    accessibleQueueIds,
  }: VisibleItemArgs): Promise<InboxItemEntity | null> {
    return this.inboxItemRepository.findOne(workspaceId, {
      where: [
        {
          id: inboxItemId,
          assigneeUserWorkspaceId: actorUserWorkspaceId,
        },
        ...(accessibleQueueIds.length > 0
          ? [{ id: inboxItemId, queueId: In(accessibleQueueIds) }]
          : []),
      ],
      relations: { inboxItemType: true, toolCalls: true },
    });
  }

  async findVisibleItemOrThrow(
    args: VisibleItemArgs,
  ): Promise<InboxItemEntity> {
    const inboxItem = await this.findVisibleItem(args);

    if (!isDefined(inboxItem)) {
      throw new InboxException(
        'Inbox item not found',
        InboxExceptionCode.INBOX_ITEM_NOT_FOUND,
      );
    }

    return inboxItem;
  }

  // A write is scoped by the same rule that made the item readable, so losing
  // access between the read and the write means updating nothing.
  buildWriteScope({
    inboxItem,
    actorUserWorkspaceId,
    accessibleQueueIds,
  }: {
    inboxItem: InboxItemEntity;
    actorUserWorkspaceId: string;
    accessibleQueueIds: string[];
  }): FindOptionsWhere<InboxItemEntity> {
    // Someone who owns a queued item keeps writing through their ownership, so
    // losing the queue role later does not silently drop their writes. With no
    // queue access the scope has to match nothing, and an empty IN list is not
    // valid SQL, so a null queue stands in and never matches a queued item.
    return isDefined(inboxItem.queueId) &&
      inboxItem.assigneeUserWorkspaceId !== actorUserWorkspaceId
      ? {
          id: inboxItem.id,
          queueId:
            accessibleQueueIds.length > 0 ? In(accessibleQueueIds) : IsNull(),
        }
      : { id: inboxItem.id, assigneeUserWorkspaceId: actorUserWorkspaceId };
  }

  private buildReadScopeCriteria({
    readScope,
    actorUserWorkspaceId,
  }: {
    readScope: InboxReadScope;
    actorUserWorkspaceId: string;
  }): FindOptionsWhere<InboxItemEntity> {
    // Taking something does not remove it from the queue it came from, so the
    // team keeps seeing it and it also lands in the taker's own list.
    if (readScope.kind === 'personal') {
      return { assigneeUserWorkspaceId: actorUserWorkspaceId };
    }

    return {
      queueId: readScope.queueId,
      ...buildAssignmentCriteria(readScope.assignment),
    };
  }
}

const buildAssignmentCriteria = (
  assignment: InboxQueueAssignment,
): FindOptionsWhere<InboxItemEntity> => {
  switch (assignment) {
    case InboxQueueAssignment.UNASSIGNED:
      return { assigneeUserWorkspaceId: IsNull() };
    case InboxQueueAssignment.ASSIGNED:
      return { assigneeUserWorkspaceId: Not(IsNull()) };
    case InboxQueueAssignment.ALL:
      return {};
  }
};

type VisibleItemArgs = {
  inboxItemId: string;
  workspaceId: string;
  actorUserWorkspaceId: string;
  accessibleQueueIds: string[];
};
