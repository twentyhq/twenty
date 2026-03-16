import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { useOpenMergeRecordsPageInSidePanel } from '@/side-panel/hooks/useOpenMergeRecordsPageInSidePanel';
import { isDefined } from 'twenty-shared/utils';

export const MergeMultipleRecordsCommand = () => {
  const { objectMetadataItem, selectedRecordIds } =
    useEngineCommandExecutionContext();

  if (!isDefined(objectMetadataItem) || !isDefined(selectedRecordIds)) {
    throw new Error(
      'Object metadata item and selected record IDs are required to merge multiple records',
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
