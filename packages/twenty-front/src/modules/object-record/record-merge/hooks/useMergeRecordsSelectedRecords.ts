import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { recordStoreRecordsSelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelectorV2';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useMergeRecordsSelectedRecords = () => {
  const mergeRecordsPageInstanceId = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  )?.instanceId;

  const commandMenuNavigationMorphItemsByPage = useRecoilValueV2(
    commandMenuNavigationMorphItemsByPageState,
  );

  const selectedRecordIds =
    commandMenuNavigationMorphItemsByPage
      .get(mergeRecordsPageInstanceId ?? '')
      ?.map((morphItem) => morphItem.recordId) ?? [];

  const selectedRecords = useFamilySelectorValueV2(
    recordStoreRecordsSelectorV2,
    { recordIds: selectedRecordIds },
  );

  return {
    selectedRecords,
  };
};
