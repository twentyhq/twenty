import { useIsCurrentAiChatThreadReadOnly } from '@/ai/hooks/useIsCurrentAiChatThreadReadOnly';
import { agentChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesComponentSelector';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useCanRetryCurrentAiChatTurn = () => {
  const isReadOnly = useIsCurrentAiChatThreadReadOnly();
  const agentChatMessages = useAtomComponentSelectorValue(
    agentChatDisplayedThreadMessagesComponentSelector,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const lastUserMessage = agentChatMessages.findLast(
    (message) => message.role === 'user' && message.status !== 'queued',
  );
  const senderId = lastUserMessage?.metadata?.senderUserWorkspaceId;

  return (
    !isReadOnly &&
    isDefined(senderId) &&
    senderId === currentWorkspaceMember?.userWorkspaceId
  );
};
