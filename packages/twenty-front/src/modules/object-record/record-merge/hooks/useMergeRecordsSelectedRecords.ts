import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { recordStoreRecordsSelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelectorV2';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useMergeRecordsSelectedRecords = () => {
  const mergeRecordsPageInstanceId = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  )?.instanceId;

  const commandMenuNavigationMorphItemsByPage = useAtomValue(
    commandMenuNavigationMorphItemsByPageState,
  );

  const selectedRecordIds =
    commandMenuNavigationMorphItemsByPage
      .get(mergeRecordsPageInstanceId ?? '')
      ?.map((morphItem) => morphItem.recordId) ?? [];

  const selectedRecords = useFamilySelectorValue(recordStoreRecordsSelectorV2, {
    recordIds: selectedRecordIds,
  });

  return {
    selectedRecords,
  };
};
