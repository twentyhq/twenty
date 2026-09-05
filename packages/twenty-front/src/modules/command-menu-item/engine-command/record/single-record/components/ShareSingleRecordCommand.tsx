import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenShareRecordModal } from '@/record-share/hooks/useOpenShareRecordModal';

export const ShareSingleRecordCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();

  const selectedRecord = selectedRecords[0];

  if (!isDefined(objectMetadataItem)) {
    throw new Error('Object metadata item is required to share a record');
  }

  const { openShareRecordModal } = useOpenShareRecordModal();

  const handleExecute = () => {
    if (!isDefined(selectedRecord)) {
      return;
    }

    openShareRecordModal({
      objectMetadataId: objectMetadataItem.id,
      recordId: selectedRecord.id,
    });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
