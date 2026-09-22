import { isDefined } from 'twenty-shared/utils';

import { useChatThreadsForRecord } from '@/ai/hooks/useChatThreadsForRecord';
import { ChatThreadsCardContent } from '@/page-layout/widgets/chat-threads/components/ChatThreadsCardContent';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

// No WidgetHeaderCountEffect: one page is fetched, so the rows in hand cap at
// the page size and cannot stand in for the record's total.
export const ChatThreadsCard = () => {
  const targetRecord = useTargetRecord();
  const { threads, loading, error, refetch } =
    useChatThreadsForRecord(targetRecord);

  return (
    <ChatThreadsCardContent
      loading={loading}
      hasError={isDefined(error)}
      onRetry={() => void refetch()}
      threads={threads}
    />
  );
};
