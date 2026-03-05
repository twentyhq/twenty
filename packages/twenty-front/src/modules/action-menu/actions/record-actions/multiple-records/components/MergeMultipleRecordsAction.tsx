import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useSelectedRecordIds } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIds';
import { useOpenMergeRecordsPageInSidePanel } from '@/side-panel/hooks/useOpenMergeRecordsPageInSidePanel';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const MergeMultipleRecordsAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  if (!contextStoreCurrentViewId) {
    throw new Error('Current view ID is not defined');
  }
  const selectedRecordIds = useSelectedRecordIds();

  const { openMergeRecordsPageInSidePanel } =
    useOpenMergeRecordsPageInSidePanel({
      objectNameSingular: objectMetadataItem.nameSingular,
      objectRecordIds: selectedRecordIds,
    });

  const handleClick = () => {
    openMergeRecordsPageInSidePanel();
  };

  return <ActionDisplay onClick={handleClick} />;
};
