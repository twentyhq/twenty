import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { SidePanelAiChatPicker } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPicker';
import { SidePanelAiChatPickerRequestCleanupEffect } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerRequestCleanupEffect';
import { useOpenAiChatFromPicker } from '@/side-panel/pages/search-ai-chats/hooks/useOpenAiChatFromPicker';
import { useSearchAiChatThreads } from '@/side-panel/pages/search-ai-chats/hooks/useSearchAiChatThreads';

export const SidePanelSearchAiChatsContent = () => {
  const [pendingOpenRequests] = useState(() => new Set<AbortController>());
  const {
    threads,
    isLoading,
    isFetchingMore,
    hasNextPage,
    error,
    fetchMoreRecords,
    refetch,
  } = useSearchAiChatThreads();
  const { openThread, openingThreadId, hasOpenError } = useOpenAiChatFromPicker(
    { pendingOpenRequests },
  );

  return (
    <>
      <SidePanelAiChatPickerRequestCleanupEffect
        pendingOpenRequests={pendingOpenRequests}
      />
      <SidePanelAiChatPicker
        threads={threads}
        isLoading={isLoading}
        isFetchingMore={isFetchingMore}
        hasNextPage={hasNextPage}
        hasError={isDefined(error)}
        openingThreadId={openingThreadId}
        hasOpenError={hasOpenError}
        onSelectThread={(threadId) => void openThread(threadId)}
        onLoadMore={() => void fetchMoreRecords()}
        onRetry={() => void refetch().catch(() => undefined)}
      />
    </>
  );
};
