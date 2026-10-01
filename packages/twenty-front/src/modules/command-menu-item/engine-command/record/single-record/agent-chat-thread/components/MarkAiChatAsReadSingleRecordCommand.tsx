import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';

export const MarkAiChatAsReadSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { markAgentChatThreadAsRead } = useAgentChatThreadParticipants();

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={() => markAgentChatThreadAsRead(selectedRecords[0].id)}
    />
  );
};
