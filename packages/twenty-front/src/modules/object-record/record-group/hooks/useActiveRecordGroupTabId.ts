import { selectedRecordGroupTabIdComponentState } from '@/object-record/record-group/states/selectedRecordGroupTabIdComponentState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { getActiveRecordGroupTabId } from '@/object-record/record-group/utils/getActiveRecordGroupTabId';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type ViewType } from '@/views/types/ViewType';

export const useActiveRecordGroupTabId = (viewType: ViewType) => {
  const selectedRecordGroupId = useAtomComponentStateValue(
    selectedRecordGroupTabIdComponentState,
  );

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    viewType,
  );

  return getActiveRecordGroupTabId({
    selectedRecordGroupId,
    visibleRecordGroupIds,
  });
};
