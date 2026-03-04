import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useMergeRecordsSelectedRecords = () => {
  const mergeRecordsPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  const sidePanelNavigationMorphItemsByPage = useAtomStateValue(
    sidePanelNavigationMorphItemsByPageState,
  );

  const selectedRecordIds =
    sidePanelNavigationMorphItemsByPage
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
