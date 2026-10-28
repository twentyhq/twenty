import { useChatThreadsForRecord } from '@/ai/hooks/useChatThreadsForRecord';
import { useDetachChatThreadFromRecord } from '@/ai/hooks/useDetachChatThreadFromRecord';
import { ChatThreadsCardContent } from '@/page-layout/widgets/chat-threads/components/ChatThreadsCardContent';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useToast } from 'twenty-ui/components/feedback';

export const ChatThreadsCard = () => {
  const targetRecord = useTargetRecord();
  const {
    threads,
    getAllLinkIdsToThread,
    loading,
    error,
    refetch,
    hasNextPage,
    fetchMoreThreads,
    isFetchingMoreThreads,
  } = useChatThreadsForRecord(targetRecord);
  const { detachChatThreadFromRecord } = useDetachChatThreadFromRecord();
  const { enqueueToast } = useToast();

  const handleDetachThread = async (threadId: string) => {
    try {
      const linkIds = await getAllLinkIdsToThread(threadId);

      await detachChatThreadFromRecord(linkIds);
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <ChatThreadsCardContent
      loading={loading}
      error={error}
      onRetry={() => void refetch()}
      onDetachThread={(threadId) => void handleDetachThread(threadId)}
      threads={threads}
      hasNextPage={hasNextPage}
      isFetchingMoreThreads={isFetchingMoreThreads}
      onLoadMore={() => void fetchMoreThreads()}
    />
  );
};
