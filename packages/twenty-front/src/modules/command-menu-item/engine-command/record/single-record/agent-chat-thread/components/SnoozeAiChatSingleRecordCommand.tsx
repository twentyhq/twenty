import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';

export const SnoozeAiChatSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { openSnoozeAiChatInSidePanel } = useOpenSnoozeAiChatInSidePanel();

  const handleExecute = () => {
    const selectedRecord = selectedRecords[0];

    if (!isDefined(selectedRecord)) {
      return;
    }

    openSnoozeAiChatInSidePanel(selectedRecord.id);
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
