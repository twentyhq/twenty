import { isDefined } from 'twenty-shared/utils';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';

export const MarkAiChatAsReadSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { markAgentChatThreadAsRead } = useAgentChatThreadParticipants();

  const handleExecute = async () => {
    const selectedRecord = selectedRecords[0];

    if (!isDefined(selectedRecord)) {
      return;
    }

    await markAgentChatThreadAsRead(selectedRecord.id);
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
