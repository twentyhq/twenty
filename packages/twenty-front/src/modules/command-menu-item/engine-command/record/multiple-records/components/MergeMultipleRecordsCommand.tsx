import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useMountedEngineCommandContext } from '@/command-menu-item/engine-command/hooks/useMountedEngineCommandContext';
import { useOpenMergeRecordsPageInSidePanel } from '@/side-panel/hooks/useOpenMergeRecordsPageInSidePanel';
import { isDefined } from 'twenty-shared/utils';

export const MergeMultipleRecordsCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useMountedEngineCommandContext();

  const selectedRecordIds = selectedRecords.map((record) => record.id);

  if (!isDefined(objectMetadataItem) || selectedRecordIds.length === 0) {
    throw new Error(
      'Object metadata item and selected records are required to merge multiple records',
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
