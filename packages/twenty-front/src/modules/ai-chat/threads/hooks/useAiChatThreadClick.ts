import { useOpenAiChatThread } from '@/ai-chat/hooks/useOpenAiChatThread';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

type UseAiChatThreadClickOptions = {
  resetNavigationStack?: boolean;
  shouldOpenInFullPage?: boolean;
};

export const useAiChatThreadClick = (
  options: UseAiChatThreadClickOptions = {},
) => {
  const { resetNavigationStack = false, shouldOpenInFullPage = false } =
    options;
  const { openAiChatThread } = useOpenAiChatThread();

  const handleThreadClick = (thread: Pick<AiChatThreadRecord, 'id'>) =>
    openAiChatThread({
      threadId: thread.id,
      shouldOpenInFullPage,
      resetNavigationStack,
    });

  return { handleThreadClick };
};
