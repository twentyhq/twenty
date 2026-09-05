import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import {
  type InboxItemTransition,
  SELF_ASSIGNMENT,
} from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const MAX_RESURFACE_MINUTES = 60 * 24 * 365;

export type TransitionInboxItemArgs = {
  inboxItemId: string;
  workspaceId: string;
  actorUserWorkspaceId: string;
  accessibleQueueIds: string[];
  transition: InboxItemTransition;
  // Omitted means "apply regardless", which is what a producer wants; a UI that
  // read the item should always pass what it read.
  expectedVersion?: number;
  // Passed by a caller that already loaded and authorised the item, so the same
  // row is not read twice for one mutation.
  loadedInboxItem?: InboxItemEntity;
};

@Injectable()
export class InboxTransitionService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxItemEntity)
    private readonly inboxItemRepository: WorkspaceScopedRepository<InboxItemEntity>,
    private readonly inboxItemService: InboxItemService,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

  async transition({
    inboxItemId,
    workspaceId,
    actorUserWorkspaceId,
    accessibleQueueIds,
    transition,
    expectedVersion,
    loadedInboxItem,
  }: TransitionInboxItemArgs): Promise<InboxItemEntity> {
    const visibleItemArgs = {
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
    };
    const inboxItem =
      loadedInboxItem ??
      (await this.inboxItemService.findVisibleItemOrThrow(visibleItemArgs));

    if (transition.kind === 'ASSIGN') {
      await this.assertRecipientBelongsToWorkspace({
        workspaceId,
        actorUserWorkspaceId,
        toUserWorkspaceId: transition.toUserWorkspaceId,
      });
    }

    // The version guard lives in the WHERE clause, so losing the race means
    // updating nothing rather than overwriting the winner.
    const updateResult = await this.inboxItemRepository.update(
      workspaceId,
      {
        ...this.inboxItemService.buildWriteScope({
          inboxItem,
          actorUserWorkspaceId,
          accessibleQueueIds,
        }),
        ...(isDefined(expectedVersion) ? { version: expectedVersion } : {}),
      },
      {
        ...this.buildPartialUpdate({
          inboxItem,
          actorUserWorkspaceId,
          transition,
        }),
        version: () => '"version" + 1',
      },
    );

    if (updateResult.affected === 0) {
      throw new InboxException(
        `Inbox item ${inboxItemId} changed since it was read`,
        InboxExceptionCode.INBOX_ITEM_CHANGED,
      );
    }

    // Read back by id rather than through the actor's visibility: handing a
    // personal item to someone else has just taken it out of the actor's view.
    const updatedInboxItem = await this.inboxItemRepository.findOne(
      workspaceId,
      {
        where: { id: inboxItemId },
        relations: { inboxItemType: true, toolCalls: true },
      },
    );

    if (!isDefined(updatedInboxItem)) {
      throw new InboxException(
        `Inbox item ${inboxItemId} not found`,
        InboxExceptionCode.INBOX_ITEM_NOT_FOUND,
      );
    }

    return updatedInboxItem;
  }

  // The recipient is a user workspace id, which the caller could have copied
  // from anywhere, so it has to be a member of this workspace.
  private async assertRecipientBelongsToWorkspace({
    workspaceId,
    actorUserWorkspaceId,
    toUserWorkspaceId,
  }: {
    workspaceId: string;
    actorUserWorkspaceId: string;
    toUserWorkspaceId: string | null | typeof SELF_ASSIGNMENT;
  }): Promise<void> {
    if (
      !isDefined(toUserWorkspaceId) ||
      toUserWorkspaceId === SELF_ASSIGNMENT ||
      toUserWorkspaceId === actorUserWorkspaceId
    ) {
      return;
    }

    const recipient =
      await this.userWorkspaceService.findById(toUserWorkspaceId);

    if (!isDefined(recipient) || recipient.workspaceId !== workspaceId) {
      throw new InboxException(
        `User workspace ${toUserWorkspaceId} is not a member of this workspace`,
        InboxExceptionCode.UNKNOWN_INBOX_RECIPIENT,
      );
    }
  }

  private buildPartialUpdate({
    inboxItem,
    actorUserWorkspaceId,
    transition,
  }: {
    inboxItem: InboxItemEntity;
    actorUserWorkspaceId: string;
    transition: InboxItemTransition;
  }): QueryDeepPartialEntity<InboxItemEntity> {
    switch (transition.kind) {
      case 'CLEAR':
        return {
          // Stamped by the database, like the events these are compared
          // against, so a clear racing an event resolves on the order Postgres
          // saw them rather than on this process's clock.
          clearedAt: () => 'clock_timestamp()',
          clearedByUserWorkspaceId: actorUserWorkspaceId,
          // Only ever compared against a reading request's own clock, so it is
          // the one timestamp here that belongs to this process.
          resurfaceAt: isDefined(transition.resurfaceAt)
            ? this.atTime(transition.resurfaceAt)
            : null,
          outcome: transition.outcome ?? null,
          // Clearing something means having seen it.
          readAt: () => 'clock_timestamp()',
        };

      case 'REOPEN':
        return {
          clearedAt: null,
          clearedByUserWorkspaceId: null,
          resurfaceAt: null,
          outcome: null,
        };

      case 'ASSIGN': {
        const assignee = this.readAssignee(
          inboxItem,
          transition.toUserWorkspaceId === SELF_ASSIGNMENT
            ? actorUserWorkspaceId
            : transition.toUserWorkspaceId,
        );

        return {
          assigneeUserWorkspaceId: assignee,
          // Handing work to someone is not something they have seen yet.
          ...(assignee === inboxItem.assigneeUserWorkspaceId
            ? {}
            : { readAt: null }),
        };
      }
    }
  }

  // Work cannot be left unaddressed, so an item with no queue behind it has
  // nowhere to be given back to.
  private readAssignee(
    inboxItem: InboxItemEntity,
    toUserWorkspaceId: string | null,
  ): string | null {
    if (!isDefined(toUserWorkspaceId) && !isDefined(inboxItem.queueId)) {
      throw new InboxException(
        'An inbox item that belongs to no queue cannot be left unassigned',
        InboxExceptionCode.INVALID_INBOX_ACTION,
        {
          userFriendlyMessage: msg`Work that belongs to no shared inbox cannot be left unassigned.`,
        },
      );
    }

    return toUserWorkspaceId;
  }

  private atTime(resurfaceAt: Date): Date {
    const minutes = (resurfaceAt.getTime() - Date.now()) / 60_000;

    if (
      !Number.isFinite(minutes) ||
      minutes <= 0 ||
      minutes > MAX_RESURFACE_MINUTES
    ) {
      throw new InboxException(
        `Resurfacing must be between 1 and ${MAX_RESURFACE_MINUTES} minutes away`,
        InboxExceptionCode.INVALID_INBOX_ACTION,
        {
          userFriendlyMessage: msg`Choose a time to come back to this that is in the future and less than a year away.`,
        },
      );
    }

    return resurfaceAt;
  }
}
