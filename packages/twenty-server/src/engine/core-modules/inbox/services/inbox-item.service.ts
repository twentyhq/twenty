import { Injectable, NotFoundException } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, LessThanOrEqual, MoreThan, Or } from 'typeorm';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxItemScope } from 'src/engine/core-modules/inbox/enums/inbox-item-scope.enum';
import { InboxItemStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-status.enum';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export const DEFAULT_INBOX_PAGE_SIZE = 50;
export const MAX_INBOX_PAGE_SIZE = 500;

// Reads and the one mutation that is not a transition. Everything that changes
// an item's state lives in InboxTransitionService.
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
  // actually happened rather than by what the assignee last looked at. It is
  // also not a transition: it does not move the item or bump its version.
  async markRead({
    inboxItemId,
    workspaceId,
    assigneeUserWorkspaceId,
  }: OwnedItemArgs): Promise<InboxItemEntity> {
    const inboxItem = await this.findOwnedItemOrThrow({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId,
    });

    await this.inboxItemRepository.update(
      workspaceId,
      { id: inboxItem.id, assigneeUserWorkspaceId },
      { readAt: new Date(), updatedAt: () => '"updatedAt"' },
    );

    return this.findOwnedItemOrThrow({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId,
    });
  }

  async findOwnedItem({
    inboxItemId,
    workspaceId,
    assigneeUserWorkspaceId,
  }: OwnedItemArgs): Promise<InboxItemEntity | null> {
    return this.inboxItemRepository.findOne(workspaceId, {
      where: { id: inboxItemId, assigneeUserWorkspaceId },
      relations: { inboxItemType: true },
    });
  }

  async findOwnedItemOrThrow({
    inboxItemId,
    workspaceId,
    assigneeUserWorkspaceId,
  }: OwnedItemArgs): Promise<InboxItemEntity> {
    const inboxItem = await this.findOwnedItem({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId,
    });

    if (!isDefined(inboxItem)) {
      throw new NotFoundException('Inbox item not found');
    }

    return inboxItem;
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
          status: In([InboxItemStatus.RESOLVED, InboxItemStatus.CANCELLED]),
        };
    }
  }
}

type OwnedItemArgs = {
  inboxItemId: string;
  workspaceId: string;
  assigneeUserWorkspaceId: string;
};
