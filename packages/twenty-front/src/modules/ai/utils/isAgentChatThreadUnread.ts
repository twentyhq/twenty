import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadParticipantState } from '@/ai/types/AgentChatThreadParticipantState';

export const isAgentChatThreadUnread = (
  lastActivityAt: string | null | undefined,
  participant: AgentChatThreadParticipantState | undefined,
): boolean => {
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
