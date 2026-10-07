import { useIsCurrentAiChatThreadReadOnly } from '@/ai/hooks/useIsCurrentAiChatThreadReadOnly';
import { agentChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useCanRetryCurrentAiChatTurn = () => {
  const isReadOnly = useIsCurrentAiChatThreadReadOnly();
  const agentChatDisplayedThreadMessages = useAtomStateValue(
    agentChatDisplayedThreadMessagesSelector,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const lastUserMessage = agentChatDisplayedThreadMessages.findLast(
    (message) => message.role === 'user' && message.status !== 'queued',
  );
  const senderId = lastUserMessage?.metadata?.senderUserWorkspaceId;

  return (
    !isReadOnly &&
    isDefined(senderId) &&
    senderId === currentWorkspaceMember?.userWorkspaceId
  );
};
