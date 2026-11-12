import { ALL_RECORD_GROUPS_TAB_ID } from '@/object-record/record-group/constants/AllRecordGroupsTabId';
import { activeRecordGroupTabIdComponentSelector } from '@/object-record/record-group/states/selectors/activeRecordGroupTabIdComponentSelector';
import { isRecordGroupTabsDisplayedComponentSelector } from '@/object-record/record-group/states/selectors/isRecordGroupTabsDisplayedComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const isAllRecordGroupsTabActiveComponentSelector =
  createAtomComponentSelector<boolean>({
    key: 'isAllRecordGroupsTabActiveComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) =>
        get(isRecordGroupTabsDisplayedComponentSelector, { instanceId }) &&
        get(activeRecordGroupTabIdComponentSelector, { instanceId }) ===
          ALL_RECORD_GROUPS_TAB_ID,
  });
