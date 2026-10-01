import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';

export const isAgentChatThreadUnread = ({
  lastActivityAt,
  participant,
}: AgentChatThreadInboxState): boolean => {
  if (!isDefined(lastActivityAt)) {
    return false;
  }

  if (!isDefined(participant) || !isDefined(participant.lastReadAt)) {
    return true;
  }

  return (
    new Date(lastActivityAt).getTime() >
    new Date(participant.lastReadAt).getTime()
  );
};
