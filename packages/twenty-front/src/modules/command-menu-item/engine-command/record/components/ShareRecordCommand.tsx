import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenShareRecordInSidePanel } from '@/side-panel/hooks/useOpenShareRecordInSidePanel';

export const ShareRecordCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();
  const { openShareRecordInSidePanel } = useOpenShareRecordInSidePanel();
  const [selectedRecord, ...otherSelectedRecords] = selectedRecords;

  if (
    !isDefined(objectMetadataItem) ||
    !isDefined(selectedRecord) ||
    otherSelectedRecords.length > 0
  ) {
    throw new Error('Sharing needs exactly one selected record');
  }

  const handleExecute = () =>
    openShareRecordInSidePanel({
      objectMetadataItem,
      recordId: selectedRecord.id,
    });

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
