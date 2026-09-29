import { AiChatThreadDeleteConfirmationModal } from '@/ai/components/AiChatThreadDeleteConfirmationModal';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useChatThreadsForRecord } from '@/ai/hooks/useChatThreadsForRecord';
import { useDetachChatThreadFromRecord } from '@/ai/hooks/useDetachChatThreadFromRecord';
import { ChatThreadsCardContent } from '@/page-layout/widgets/chat-threads/components/ChatThreadsCardContent';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

// No WidgetHeaderCountEffect: one page is fetched, so the rows in hand cap at
// the page size and cannot stand in for the record's total.
export const ChatThreadsCard = () => {
  const targetRecord = useTargetRecord();
  const { threads, getLinkIdsToThread, loading, error, refetch } =
    useChatThreadsForRecord(targetRecord);
  const { detachChatThreadFromRecord } = useDetachChatThreadFromRecord();

  return (
    <>
      <ChatThreadsCardContent
        loading={loading}
        error={error}
        onRetry={() => void refetch()}
        onDetachThread={(threadId) =>
          void detachChatThreadFromRecord(getLinkIdsToThread(threadId))
        }
        threads={threads}
      />
      {/* Each surface mounts its own confirmation: the row only opens a dialog
          id derived from the surface, so without this delete is a no-op here. */}
      <AiChatThreadDeleteConfirmationModal
        surface={AI_CHAT_THREAD_ACTIONS_SURFACE.RECORD_PAGE}
      />
    </>
  );
};
