import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import {
  type InboxItemTransition,
  SELF_ASSIGNMENT,
} from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';

const MAX_RESURFACE_MINUTES = 60 * 24 * 365;

// Work cannot be left unaddressed, so an item with no queue behind it has
// nowhere to be given back to.
const readAssignee = (
  inboxItem: InboxItemEntity,
  toUserWorkspaceId: string | null,
): string | null => {
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
};

const atTime = (resurfaceAt: Date): Date => {
  const minutes = (resurfaceAt.getTime() - Date.now()) / 60_000;

  if (
    !Number.isFinite(minutes) ||
    minutes <= 0 ||
    minutes > MAX_RESURFACE_MINUTES
  ) {
    throw new InboxException(
      `Resurfacing must be in the future and at most ${MAX_RESURFACE_MINUTES} minutes away`,
      InboxExceptionCode.INVALID_INBOX_ACTION,
      {
        userFriendlyMessage: msg`Choose a time to come back to this that is in the future and less than a year away.`,
      },
    );
  }

  return resurfaceAt;
};

// What a transition changes, and nothing about how it is applied. An empty
// patch means the transition resolved to no change, which the caller turns
// into no write at all rather than a version bump for nothing.
type BuildInboxItemPartialUpdateArgs = {
  inboxItem: InboxItemEntity;
  actorUserWorkspaceId: string;
  transition: InboxItemTransition;
};

// A function declaration rather than the usual arrow const: the return type
// is a TypeORM mapped type whose expansion the compiler refuses to serialize
// for an exported binding.
export function buildInboxItemPartialUpdate({
  inboxItem,
  actorUserWorkspaceId,
  transition,
}: BuildInboxItemPartialUpdateArgs): QueryDeepPartialEntity<InboxItemEntity> {
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
          ? atTime(transition.resurfaceAt)
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

    case 'MOVE': {
      if (transition.toQueueId === inboxItem.queueId) {
        return {};
      }

      // The database refuses an item that belongs to no inbox and nobody, so
      // taking the last shared inbox away leaves it with the person doing it
      // rather than with no one.
      const assignee =
        isDefined(transition.toQueueId) ||
        isDefined(inboxItem.assigneeUserWorkspaceId)
          ? inboxItem.assigneeUserWorkspaceId
          : actorUserWorkspaceId;

      // Landing somewhere new is a fresh start there, the same way handing
      // work to a person is: a team should not inherit the snooze of whoever
      // held it before.
      return {
        queueId: transition.toQueueId,
        assigneeUserWorkspaceId: assignee,
        // A slot is unique per inbox, so the destination may already hold one
        // with this key. The item gives up its slot rather than its existence,
        // as it does when the inbox it was in is deleted. Nothing is lost that
        // worked: a fold looks in the address the router resolved, so a moved
        // item was already out of reach of the events that fed it.
        slotKey: null,
        readAt: null,
        clearedAt: null,
        clearedByUserWorkspaceId: null,
        resurfaceAt: null,
        outcome: null,
      };
    }

    case 'ASSIGN': {
      const assignee = readAssignee(
        inboxItem,
        transition.toUserWorkspaceId === SELF_ASSIGNMENT
          ? actorUserWorkspaceId
          : transition.toUserWorkspaceId,
      );

      if (assignee === inboxItem.assigneeUserWorkspaceId) {
        return {};
      }

      // Handing work over is a fresh start for whoever receives it: the
      // previous holder's snooze or archive is theirs, not the new
      // assignee's, and inheriting it would land the item straight in the
      // recipient's Done where they would never see it.
      return {
        assigneeUserWorkspaceId: assignee,
        readAt: null,
        clearedAt: null,
        clearedByUserWorkspaceId: null,
        resurfaceAt: null,
        outcome: null,
      };
    }
  }
}
