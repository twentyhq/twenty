import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenMergeRecordsPageInSidePanel } from '@/side-panel/hooks/useOpenMergeRecordsPageInSidePanel';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const MergeMultipleRecordsCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();

  const selectedRecordIds = selectedRecords.map((record) => record.id);

  if (!isDefined(objectMetadataItem) || selectedRecordIds.length === 0) {
    throw new Error(
      doNotTranslate(
        'Object metadata item and selected records are required to merge multiple records',
      ),
    );
  }

  const { openMergeRecordsPageInSidePanel } =
    useOpenMergeRecordsPageInSidePanel({
      objectNameSingular: objectMetadataItem.nameSingular,
      objectRecordIds: selectedRecordIds,
    });

  const handleExecute = () => {
    openMergeRecordsPageInSidePanel();
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
