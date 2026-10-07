import { isAfter } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// Activity and archiving have different writers and are compared rather than
// folded into a status, so a message landing right after an archive brings the
// thread back whichever write committed last. Snooze is an archive with a
// wake-up time; the server unarchives the thread when it passes and keeps the
// snooze as what brought it back. A member who unsubscribed keeps the thread
// under done whatever happens in it. A chat in a channel is the member's only
// once they follow it or file it themselves; until then it is the channel's.
export const getAgentChatThreadInboxStatus = ({
  lastActivityAt,
  participant,
  isInChannel,
}: {
  lastActivityAt: string | null | undefined;
  participant: AgentChatThreadParticipantFieldsFragment | undefined;
  isInChannel: boolean;
}): Omit<AgentChatThreadInboxStatus, 'isAssignedToMe' | 'isChannelCopy'> => {
  const isUnread =
    isDefined(lastActivityAt) &&
    (!isDefined(participant?.lastReadAt) ||
      isAfter(lastActivityAt, participant.lastReadAt));
  const isSubscribed = participant?.isSubscribed ?? !isInChannel;
  const isMentioned = isDefined(participant?.lastMentionedAt);
  const archivedAt = participant?.archivedAt;
  const snoozedUntil = participant?.snoozedUntil;

  if (!isSubscribed && isInChannel && !isDefined(archivedAt)) {
    return {
      scope: 'NONE',
      isUnread,
      isSubscribed,
      isMentioned,
      event: null,
    };
  }

  if (!isSubscribed) {
    return {
      scope: 'ARCHIVED',
      isUnread,
      isSubscribed,
      isMentioned,
      event: isDefined(archivedAt)
        ? { type: 'UNSUBSCRIBED', at: archivedAt }
        : null,
    };
  }

  if (!isDefined(archivedAt)) {
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

  if (isDefined(lastActivityAt) && isAfter(lastActivityAt, archivedAt)) {
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
      event: { type: 'DONE', at: archivedAt },
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
