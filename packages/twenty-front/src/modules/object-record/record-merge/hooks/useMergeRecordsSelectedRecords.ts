import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { recordStoreRecordsSelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelectorV2';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useMergeRecordsSelectedRecords = () => {
  const mergeRecordsPageInstanceId = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  )?.instanceId;

  const commandMenuNavigationMorphItemsByPage = useAtomStateValue(
    commandMenuNavigationMorphItemsByPageState,
  );

  const selectedRecordIds =
    commandMenuNavigationMorphItemsByPage
      .get(mergeRecordsPageInstanceId ?? '')
      ?.map((morphItem) => morphItem.recordId) ?? [];

  const selectedRecords = useAtomFamilySelectorValue(
    recordStoreRecordsSelectorV2,
    {
      recordIds: selectedRecordIds,
    },
  );

  return {
    selectedRecords,
  };
};
