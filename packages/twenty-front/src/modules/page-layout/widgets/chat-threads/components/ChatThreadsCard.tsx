import { useChatThreadsForRecord } from '@/ai/hooks/useChatThreadsForRecord';
import { ChatThreadsCardContent } from '@/page-layout/widgets/chat-threads/components/ChatThreadsCardContent';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

export const ChatThreadsCard = () => {
  const targetRecord = useTargetRecord();
  const { threads, loading } = useChatThreadsForRecord(targetRecord);

  return (
    <>
      <WidgetHeaderCountEffect count={threads.length} />
      <ChatThreadsCardContent loading={loading} threads={threads} />
    </>
  );
};
