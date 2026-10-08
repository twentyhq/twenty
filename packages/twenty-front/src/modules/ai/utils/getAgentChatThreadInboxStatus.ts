import { isAfter } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// doneAt is when the member took the thread out of their inbox: marked done,
// snoozed or unsubscribed. Activity after it brings the thread back, unless
// the member unsubscribed, and is compared rather than folded into a status
// so a message landing right after doneAt wins whichever write committed
// last. When a snooze ends the server clears doneAt and keeps snoozedUntil as
// what brought the thread back.
export const getAgentChatThreadInboxStatus = ({
  lastActivityAt,
  participant,
}: {
  lastActivityAt: string | null | undefined;
  participant: AgentChatThreadParticipantFieldsFragment | undefined;
}): Omit<AgentChatThreadInboxStatus, 'isAssignedToMe'> => {
  const isUnread =
    isDefined(lastActivityAt) &&
    (!isDefined(participant?.lastReadAt) ||
      isAfter(lastActivityAt, participant.lastReadAt));
  const isSubscribed = participant?.isSubscribed ?? true;
  const isMentioned = isDefined(participant?.lastMentionedAt);
  const doneAt = participant?.doneAt;
  const snoozedUntil = participant?.snoozedUntil;

  if (!isSubscribed) {
    return {
      scope: 'ARCHIVED',
      isUnread,
      isSubscribed,
      isMentioned,
      event: isDefined(doneAt) ? { type: 'UNSUBSCRIBED', at: doneAt } : null,
    };
  }

  if (!isDefined(doneAt)) {
    return {
      scope: 'INBOX',
      isUnread,
      isSubscribed,
      isMentioned,
      event:
        isDefined(snoozedUntil) &&
        !(isDefined(lastActivityAt) && isAfter(lastActivityAt, snoozedUntil))
          ? { type: 'SNOOZE_ENDED', at: snoozedUntil }
          : null,
    };
  }

  if (isDefined(lastActivityAt) && isAfter(lastActivityAt, doneAt)) {
    return {
      scope: 'INBOX',
      isUnread,
      isSubscribed,
      isMentioned,
      event: null,
    };
  }

  if (!isDefined(snoozedUntil)) {
    return {
      scope: 'ARCHIVED',
      isUnread,
      isSubscribed,
      isMentioned,
      event: { type: 'DONE', at: doneAt },
    };
  }

  return {
    scope: 'SNOOZED',
    isUnread,
    isSubscribed,
    isMentioned,
    event: { type: 'SNOOZED', at: snoozedUntil },
  };
};
