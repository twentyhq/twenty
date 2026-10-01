import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';

export const MarkAiChatAsUnreadSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { markAgentChatThreadAsUnread } = useAgentChatThreadParticipants();

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={() => markAgentChatThreadAsUnread(selectedRecords[0].id)}
    />
  );
};
