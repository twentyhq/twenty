import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenShareRecordInSidePanel } from '@/side-panel/hooks/useOpenShareRecordInSidePanel';

export const ShareRecordCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();
  const { openShareRecordInSidePanel } = useOpenShareRecordInSidePanel();

  if (!isDefined(objectMetadataItem) || selectedRecords.length !== 1) {
    throw new Error('Sharing needs exactly one selected record');
  }

  const handleExecute = () =>
    openShareRecordInSidePanel({
      objectMetadataItem,
      recordId: selectedRecords[0].id,
    });

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
