import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
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
    recordStoreRecordsSelector,
    {
      recordIds: selectedRecordIds,
    },
  );

  return {
    selectedRecords,
  };
};
