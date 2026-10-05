import { isAfter } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// Activity and archiving have different writers and are compared rather than
// folded into a status, so a message landing right after an archive brings the
// thread back whichever write committed last. Snooze is an archive with a
// wake-up time; the server unarchives the thread when it passes and keeps the
// snooze as what brought it back
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
  const snoozedUntil = participant?.snoozedUntil;

  if (!isDefined(archivedAt)) {
    return {
      scope: 'INBOX',
      isUnread,
      event:
        isDefined(snoozedUntil) &&
        !(isDefined(lastActivityAt) && isAfter(lastActivityAt, snoozedUntil))
          ? { type: 'SNOOZE_ENDED', at: snoozedUntil }
          : null,
    };
  }

  if (isDefined(lastActivityAt) && isAfter(lastActivityAt, archivedAt)) {
    return { scope: 'INBOX', isUnread, event: null };
  }

  if (!isDefined(snoozedUntil)) {
    return {
      scope: 'ARCHIVED',
      isUnread,
      event: { type: 'DONE', at: archivedAt },
    };
  }

  return {
    scope: 'SNOOZED',
    isUnread,
    event: { type: 'SNOOZED', at: snoozedUntil },
  };
};
