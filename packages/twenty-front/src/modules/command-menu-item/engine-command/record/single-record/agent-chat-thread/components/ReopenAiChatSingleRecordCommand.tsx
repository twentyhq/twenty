import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';

export const ReopenAiChatSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { moveAgentChatThreadToInbox } = useAgentChatThreadParticipants();

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={() => moveAgentChatThreadToInbox(selectedRecords[0].id)}
    />
  );
};
