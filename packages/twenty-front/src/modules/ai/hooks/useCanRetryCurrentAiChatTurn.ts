import { useIsCurrentInboxThreadReadOnly } from '@/ai/hooks/useIsCurrentInboxThreadReadOnly';
import { inboxDisplayedThreadMessagesSelector } from '@/ai/states/selectors/inboxDisplayedThreadMessagesSelector';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useCanRetryCurrentAiChatTurn = () => {
  const isReadOnly = useIsCurrentInboxThreadReadOnly();
  const inboxDisplayedThreadMessages = useAtomStateValue(
    inboxDisplayedThreadMessagesSelector,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const lastUserMessage = inboxDisplayedThreadMessages.findLast(
    (message) => message.role === 'user' && message.status !== 'queued',
  );
  const senderId = lastUserMessage?.metadata?.senderWorkspaceMemberId;

  return (
    !isReadOnly &&
    isDefined(senderId) &&
    senderId === currentWorkspaceMember?.id
  );
};
