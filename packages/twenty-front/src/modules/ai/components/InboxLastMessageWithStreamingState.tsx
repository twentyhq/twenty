import { InboxMessage } from '@/ai/components/InboxMessage';
import { inboxDisplayedThreadState } from '@/ai/states/inboxDisplayedThreadState';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { inboxLastMessageIdSelector } from '@/ai/states/selectors/inboxLastMessageIdSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const InboxLastMessageWithStreamingState = () => {
  const inboxLastMessageId = useAtomStateValue(inboxLastMessageIdSelector);

  const inboxDisplayedThread = useAtomStateValue(inboxDisplayedThreadState);
  const agentChatIsStreaming = useAtomFamilyStateValue(
    agentChatIsStreamingFamilyState,
    { threadId: inboxDisplayedThread },
  );
  const agentChatError = useAtomFamilyStateValue(agentChatErrorFamilyState, {
    threadId: inboxDisplayedThread,
  });

  if (!isDefined(inboxLastMessageId)) {
    return null;
  }

  return (
    <InboxMessage
      messageId={inboxLastMessageId}
      isLastMessageStreaming={agentChatIsStreaming}
      error={agentChatError ?? undefined}
    />
  );
};
