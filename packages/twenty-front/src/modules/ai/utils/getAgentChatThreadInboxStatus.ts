import { isAfter } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// Activity and archiving have different writers and are compared rather than
// folded into a status, so a message landing right after an archive brings the
// thread back whichever write committed last. Snooze is an archive with a
// wake-up time, which the server reports as passed
export const getAgentChatThreadInboxStatus = ({
  lastActivityAt,
  participant,
}: {
  lastActivityAt: string | null | undefined;
  participant: AgentChatThreadParticipantFieldsFragment | undefined;
}): AgentChatThreadInboxStatus => {
  const isUnread =
    isDefined(lastActivityAt) &&
    (!isDefined(participant?.lastReadAt) ||
      isAfter(lastActivityAt, participant.lastReadAt));
  const archivedAt = participant?.archivedAt;

  if (
    !isDefined(archivedAt) ||
    (isDefined(lastActivityAt) && isAfter(lastActivityAt, archivedAt))
  ) {
    return { scope: 'INBOX', isUnread, event: null };
  }

  const snoozedUntil = participant?.snoozedUntil;

  if (!isDefined(snoozedUntil)) {
    return {
      scope: 'ARCHIVED',
      isUnread,
      event: { type: 'DONE', at: archivedAt },
    };
  }

  // Still archived with no newer activity: the snooze ran out
  if (participant?.hasSnoozeEnded === true) {
    return {
      scope: 'INBOX',
      isUnread,
      event: { type: 'SNOOZE_ENDED', at: snoozedUntil },
    };
  }

  return {
    scope: 'SNOOZED',
    isUnread,
    event: { type: 'SNOOZED', at: snoozedUntil },
  };
};
