import { isDefined } from 'twenty-shared/utils';

import { useChatThreadsForRecord } from '@/ai/hooks/useChatThreadsForRecord';
import { ChatThreadsCardContent } from '@/page-layout/widgets/chat-threads/components/ChatThreadsCardContent';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

// No WidgetHeaderCountEffect: the query returns one page, so the number of
// rows in hand caps at the page size and would understate a record with more.
// Notes, tasks and emails all feed the header a server-side total; this needs
// the same, which belongs with the attach control rather than ahead of it.
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
