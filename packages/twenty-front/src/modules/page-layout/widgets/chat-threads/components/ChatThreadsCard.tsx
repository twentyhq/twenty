import { isDefined } from 'twenty-shared/utils';

import { useChatThreadsForRecord } from '@/ai/hooks/useChatThreadsForRecord';
import { ChatThreadsCardContent } from '@/page-layout/widgets/chat-threads/components/ChatThreadsCardContent';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

export const ChatThreadsCard = () => {
  const targetRecord = useTargetRecord();
  const { threads, loading, error, refetch } =
    useChatThreadsForRecord(targetRecord);

  return (
    <>
      <WidgetHeaderCountEffect count={threads.length} />
      <ChatThreadsCardContent
        loading={loading}
        hasError={isDefined(error)}
        onRetry={() => void refetch()}
        threads={threads}
      />
    </>
  );
};
