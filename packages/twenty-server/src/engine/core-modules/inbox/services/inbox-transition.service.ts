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
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const MAX_RESURFACE_MINUTES = 60 * 24 * 365;

export type TransitionInboxItemArgs = {
  inboxItemId: string;
  workspaceId: string;
  actorUserWorkspaceId: string;
  accessibleQueueIds: string[];
  transition: InboxItemTransition;
  // Optimistic concurrency. Omitted means "apply regardless", which is what a
  // producer wants; a UI that read the item should always pass what it read.
  expectedVersion?: number;
  // Passed by a caller that already loaded and authorised the item, so the
  // same row is not read twice for one mutation.
  loadedInboxItem?: InboxItemEntity;
};

// The assignee's side of the item. Producers write through the router; nothing
// else writes these columns, which is what keeps the two apart.
@Injectable()
export class InboxTransitionService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxItemEntity)
    private readonly inboxItemRepository: WorkspaceScopedRepository<InboxItemEntity>,
    private readonly inboxItemService: InboxItemService,
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

    // The version guard lives in the WHERE clause, so losing the race means
    // updating nothing rather than overwriting the winner
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

    return this.inboxItemService.findVisibleItemOrThrow(visibleItemArgs);
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
          // against, so a clear racing an incoming event resolves on the order
          // Postgres saw them rather than on this process's clock
          clearedAt: () => 'clock_timestamp()',
          clearedByUserWorkspaceId: actorUserWorkspaceId,
          // Only ever compared against a reading request's own clock, so it is
          // the one timestamp here that belongs to this process
          resurfaceAt: isDefined(transition.resurfaceInMinutes)
            ? this.inMinutes(transition.resurfaceInMinutes)
            : null,
          outcome: isDefined(transition.outcome)
            ? this.readOutcome(inboxItem, transition.outcome)
            : null,
          result: transition.result ?? null,
          // Clearing something means having seen it
          readAt: () => 'clock_timestamp()',
        };

      case 'REOPEN':
        return {
          clearedAt: null,
          clearedByUserWorkspaceId: null,
          resurfaceAt: null,
          outcome: null,
          result: null,
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
          // Handing work to someone is not something they have seen yet
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

  // The type decides which outcomes exist. A type that declares none accepts
  // any, so a producer can clear an item it fully controls.
  private readOutcome(inboxItem: InboxItemEntity, outcome: string): string {
    const declaredOutcomes = inboxItem.inboxItemType?.resolution?.outcomes;

    if (!isDefined(declaredOutcomes) || declaredOutcomes.length === 0) {
      return outcome;
    }

    const isDeclared = declaredOutcomes.some(
      (declaredOutcome) => declaredOutcome.key === outcome,
    );

    if (!isDeclared) {
      throw new InboxException(
        `Unknown outcome ${outcome} for inbox item type ${inboxItem.inboxItemType.key}`,
        InboxExceptionCode.INVALID_INBOX_ACTION,
      );
    }

    return outcome;
  }

  private inMinutes(minutes: number): Date {
    if (
      !Number.isFinite(minutes) ||
      minutes <= 0 ||
      minutes > MAX_RESURFACE_MINUTES
    ) {
      throw new InboxException(
        `Resurfacing must be between 1 and ${MAX_RESURFACE_MINUTES} minutes away`,
        InboxExceptionCode.INVALID_INBOX_ACTION,
        {
          userFriendlyMessage: msg`Choose a time to come back to this that is less than a year away.`,
        },
      );
    }

    return new Date(Date.now() + minutes * 60 * 1000);
  }
}
