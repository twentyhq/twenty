import { Injectable, NotFoundException } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, LessThanOrEqual, MoreThan, Or } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxItemScope } from 'src/engine/core-modules/inbox/enums/inbox-item-scope.enum';
import { InboxItemStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-status.enum';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export const DEFAULT_INBOX_PAGE_SIZE = 50;
export const MAX_INBOX_PAGE_SIZE = 500;

@Injectable()
export class InboxItemService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxItemEntity)
    private readonly inboxItemRepository: WorkspaceScopedRepository<InboxItemEntity>,
  ) {}

  async findMany({
    workspaceId,
    assigneeUserWorkspaceId,
    scope,
    limit,
  }: {
    workspaceId: string;
    assigneeUserWorkspaceId: string;
    scope: InboxItemScope;
    limit?: number;
  }): Promise<InboxItemEntity[]> {
    return this.inboxItemRepository.find(workspaceId, {
      where: {
        assigneeUserWorkspaceId,
        ...this.buildScopeCriteria(scope),
      },
      relations: { inboxItemType: true },
      order: { updatedAt: 'DESC' },
      // A non positive take reaches Postgres as "no limit", so the cap is
      // clamped at both ends rather than only at the top
      take: Math.max(
        1,
        Math.min(limit ?? DEFAULT_INBOX_PAGE_SIZE, MAX_INBOX_PAGE_SIZE),
      ),
    });
  }

  async countByScope({
    workspaceId,
    assigneeUserWorkspaceId,
  }: {
    workspaceId: string;
    assigneeUserWorkspaceId: string;
  }): Promise<{ unread: number; needsAction: number; snoozed: number }> {
    const visibleCriteria = {
      assigneeUserWorkspaceId,
      ...this.buildScopeCriteria(InboxItemScope.INBOX),
    };

    const [unread, needsAction, snoozed] = await Promise.all([
      this.inboxItemRepository.count(workspaceId, {
        where: {
          ...visibleCriteria,
          readAt: IsNull(),
        },
      }),
      this.inboxItemRepository.count(workspaceId, {
        where: {
          ...visibleCriteria,
          priority: InboxItemPriority.NEEDS_ACTION,
        },
      }),
      this.inboxItemRepository.count(workspaceId, {
        where: {
          assigneeUserWorkspaceId,
          ...this.buildScopeCriteria(InboxItemScope.SNOOZED),
        },
      }),
    ]);

    return { unread, needsAction, snoozed };
  }

  // Reading an item is not activity on it, so the list stays ordered by what
  // actually happened rather than by what the assignee last looked at
  async markRead({
    inboxItemId,
    workspaceId,
    assigneeUserWorkspaceId,
  }: OwnedItemArgs): Promise<InboxItemEntity> {
    return this.updateOwnedItem(
      { inboxItemId, workspaceId, assigneeUserWorkspaceId },
      { readAt: new Date(), updatedAt: () => '"updatedAt"' },
    );
  }

  async snooze({
    inboxItemId,
    workspaceId,
    assigneeUserWorkspaceId,
    snoozedUntil,
  }: OwnedItemArgs & { snoozedUntil: Date }): Promise<InboxItemEntity> {
    return this.updateOwnedItem(
      { inboxItemId, workspaceId, assigneeUserWorkspaceId },
      { snoozedUntil, readAt: new Date() },
    );
  }

  async complete({
    inboxItemId,
    workspaceId,
    assigneeUserWorkspaceId,
  }: OwnedItemArgs): Promise<InboxItemEntity> {
    return this.updateOwnedItem(
      { inboxItemId, workspaceId, assigneeUserWorkspaceId },
      {
        status: InboxItemStatus.DONE,
        resolvedAt: new Date(),
        resolvedByUserWorkspaceId: assigneeUserWorkspaceId,
        readAt: new Date(),
        snoozedUntil: null,
      },
    );
  }

  async reopen({
    inboxItemId,
    workspaceId,
    assigneeUserWorkspaceId,
  }: OwnedItemArgs): Promise<InboxItemEntity> {
    return this.updateOwnedItem(
      { inboxItemId, workspaceId, assigneeUserWorkspaceId },
      {
        status: InboxItemStatus.OPEN,
        resolvedAt: null,
        resolvedByUserWorkspaceId: null,
        snoozedUntil: null,
        // A reopened item is asking for attention again, so it should count
        // towards the unread badge
        readAt: null,
      },
    );
  }

  async dismiss({
    inboxItemId,
    workspaceId,
    assigneeUserWorkspaceId,
  }: OwnedItemArgs): Promise<InboxItemEntity> {
    return this.updateOwnedItem(
      { inboxItemId, workspaceId, assigneeUserWorkspaceId },
      {
        status: InboxItemStatus.DISMISSED,
        resolvedAt: new Date(),
        resolvedByUserWorkspaceId: assigneeUserWorkspaceId,
      },
    );
  }

  async findOwnedItemOrThrow({
    inboxItemId,
    workspaceId,
    assigneeUserWorkspaceId,
  }: OwnedItemArgs): Promise<InboxItemEntity> {
    const inboxItem = await this.inboxItemRepository.findOne(workspaceId, {
      where: { id: inboxItemId, assigneeUserWorkspaceId },
      relations: { inboxItemType: true },
    });

    if (!isDefined(inboxItem)) {
      throw new NotFoundException('Inbox item not found');
    }

    return inboxItem;
  }

  // Every mutation is scoped to the caller's own items, so one person can never
  // read or resolve another's inbox. The repository adds the workspace scope;
  // the assignee scope is this service's own guarantee.
  private async updateOwnedItem(
    ownedItemArgs: OwnedItemArgs,
    partialUpdate: QueryDeepPartialEntity<InboxItemEntity>,
  ): Promise<InboxItemEntity> {
    const inboxItem = await this.findOwnedItemOrThrow(ownedItemArgs);

    // The assignee is part of the write predicate, not just the preceding read,
    // so a reassignment between the two cannot let the old owner mutate it
    await this.inboxItemRepository.update(
      ownedItemArgs.workspaceId,
      {
        id: inboxItem.id,
        assigneeUserWorkspaceId: ownedItemArgs.assigneeUserWorkspaceId,
      },
      partialUpdate,
    );

    return this.findOwnedItemOrThrow(ownedItemArgs);
  }

  private buildScopeCriteria(scope: InboxItemScope) {
    const now = new Date();

    switch (scope) {
      case InboxItemScope.INBOX:
        return {
          status: InboxItemStatus.OPEN,
          snoozedUntil: Or(IsNull(), LessThanOrEqual(now)),
        };
      case InboxItemScope.SNOOZED:
        return {
          status: InboxItemStatus.OPEN,
          snoozedUntil: MoreThan(now),
        };
      case InboxItemScope.RESOLVED:
        return {
          status: In([InboxItemStatus.DONE, InboxItemStatus.DISMISSED]),
        };
    }
  }
}

type OwnedItemArgs = {
  inboxItemId: string;
  workspaceId: string;
  assigneeUserWorkspaceId: string;
};
