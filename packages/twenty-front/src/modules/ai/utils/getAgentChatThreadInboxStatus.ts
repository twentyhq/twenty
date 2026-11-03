import { isAfter } from 'date-fns';
import { isAgentChatMentionUnresolved } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export const getAgentChatThreadInboxStatus = ({
  lastActivityAt,
  participant,
}: {
  lastActivityAt: string | null | undefined;
  participant: AgentChatThreadParticipantFieldsFragment | undefined;
}): Omit<AgentChatThreadInboxStatus, 'isAssignedToMe' | 'isChannelCopy'> => {
  const isUnread =
    isDefined(lastActivityAt) &&
    isDefined(participant) &&
    (!isDefined(participant.lastReadAt) ||
      isAfter(lastActivityAt, participant.lastReadAt));
  const isSubscribed = participant?.isSubscribed ?? false;
  const isMentioned = isAgentChatMentionUnresolved({
    lastMentionedAt: participant?.lastMentionedAt,
    mentionsResolvedAt: participant?.mentionsResolvedAt,
  });
  const archivedAt = participant?.archivedAt;
  const snoozedUntil = participant?.snoozedUntil;

  if (!isSubscribed && !isDefined(archivedAt)) {
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

  if (isDefined(snoozedUntil)) {
    return {
      scope: 'SNOOZED',
      isUnread,
      isSubscribed,
      isMentioned,
      event: { type: 'SNOOZED', at: snoozedUntil },
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

  return {
    scope: 'ARCHIVED',
    isUnread,
    isSubscribed,
    isMentioned,
    event: { type: 'DONE', at: archivedAt },
  };
};
