import { useChatThreadsForRecord } from '@/ai/hooks/useChatThreadsForRecord';
import { useDetachChatThreadFromRecord } from '@/ai/hooks/useDetachChatThreadFromRecord';
import { ChatThreadsCardContent } from '@/page-layout/widgets/chat-threads/components/ChatThreadsCardContent';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

// No WidgetHeaderCountEffect: only one page is fetched, so the row count isn't the total.
export const ChatThreadsCard = () => {
  const targetRecord = useTargetRecord();
  const { threads, getLinkIdsToThread, loading, error, refetch } =
    useChatThreadsForRecord(targetRecord);
  const { detachChatThreadFromRecord } = useDetachChatThreadFromRecord();

  return (
    <ChatThreadsCardContent
      loading={loading}
      error={error}
      onRetry={() => void refetch()}
      onDetachThread={(threadId) =>
        void detachChatThreadFromRecord(getLinkIdsToThread(threadId))
      }
      threads={threads}
    />
  );
};
