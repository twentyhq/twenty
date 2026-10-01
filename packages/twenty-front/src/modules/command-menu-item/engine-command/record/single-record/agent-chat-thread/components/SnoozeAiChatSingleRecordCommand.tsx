import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';

export const SnoozeAiChatSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { openSnoozeAiChatInSidePanel } = useOpenSnoozeAiChatInSidePanel();

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={() => openSnoozeAiChatInSidePanel(selectedRecords[0].id)}
    />
  );
};
