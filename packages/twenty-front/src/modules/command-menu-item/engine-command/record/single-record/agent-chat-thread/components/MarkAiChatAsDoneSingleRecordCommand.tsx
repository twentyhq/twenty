import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';

export const MarkAiChatAsDoneSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { archiveAgentChatThread } = useAgentChatThreadParticipants();

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={() => archiveAgentChatThread(selectedRecords[0].id)}
    />
  );
};
