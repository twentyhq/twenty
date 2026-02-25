import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useSelectedRecordIds } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIds';
import { useOpenMergeRecordsPageInCommandMenu } from '@/command-menu/hooks/useOpenMergeRecordsPageInCommandMenu';
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

  const { openMergeRecordsPageInCommandMenu } =
    useOpenMergeRecordsPageInCommandMenu({
      objectNameSingular: objectMetadataItem.nameSingular,
      objectRecordIds: selectedRecordIds,
    });

  const handleClick = () => {
    openMergeRecordsPageInCommandMenu();
  };

  return <ActionDisplay onClick={handleClick} />;
};
