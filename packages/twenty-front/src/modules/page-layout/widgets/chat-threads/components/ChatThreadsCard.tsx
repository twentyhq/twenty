import { t } from '@lingui/core/macro';

import { useChatThreadsForRecord } from '@/ai/hooks/useChatThreadsForRecord';
import { useDetachChatThreadFromRecord } from '@/ai/hooks/useDetachChatThreadFromRecord';
import { ChatThreadsCardContent } from '@/page-layout/widgets/chat-threads/components/ChatThreadsCardContent';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useToast } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';

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
      pagination={
        hasNextPage && (
          <Button
            variant="ghost"
            onClick={() => void fetchMoreThreads()}
            disabled={loading || isFetchingMoreThreads}
          >
            {isFetchingMoreThreads ? t`Loading…` : t`Load more conversations`}
          </Button>
        )
      }
    />
  );
};
