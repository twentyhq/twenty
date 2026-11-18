import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useIsCurrentAiChatThreadReadOnly } from '@/ai-chat/threads/hooks/useIsCurrentAiChatThreadReadOnly';
import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useCanRetryCurrentAiChatTurn = () => {
  const isReadOnly = useIsCurrentAiChatThreadReadOnly();
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatMessages = useAtomFamilyStateValue(aiChatMessagesFamilyState, {
    threadId,
  });
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const lastUserMessage = aiChatMessages.findLast(
    (message) => message.role === 'user' && message.status !== 'queued',
  );
  const senderId = lastUserMessage?.metadata?.senderWorkspaceMemberId;

  return (
    !isReadOnly &&
    isDefined(senderId) &&
    senderId === currentWorkspaceMember?.id
  );
};
