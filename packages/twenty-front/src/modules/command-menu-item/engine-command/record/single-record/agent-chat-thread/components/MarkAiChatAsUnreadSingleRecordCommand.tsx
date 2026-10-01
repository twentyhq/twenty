import { isDefined } from 'twenty-shared/utils';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';

export const MarkAiChatAsUnreadSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { markAgentChatThreadAsUnread } = useAgentChatThreadParticipants();

  const handleExecute = async () => {
    const selectedRecord = selectedRecords[0];

    if (!isDefined(selectedRecord)) {
      return;
    }

    await markAgentChatThreadAsUnread(selectedRecord.id);
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
