import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';

export const isAgentChatMessageOwn = ({
  message,
  currentWorkspaceMemberId,
  isSenderlessUserMessageOwn,
}: {
  message: Pick<ExtendedUIMessage, 'role' | 'metadata'>;
  currentWorkspaceMemberId: string | undefined;
  isSenderlessUserMessageOwn: boolean;
}) => {
  const senderWorkspaceMemberId = message.metadata?.senderWorkspaceMemberId;

  if (isDefined(senderWorkspaceMemberId)) {
    return senderWorkspaceMemberId === currentWorkspaceMemberId;
  }

  return message.role === AGENT_MESSAGE_ROLE.USER && isSenderlessUserMessageOwn;
};
