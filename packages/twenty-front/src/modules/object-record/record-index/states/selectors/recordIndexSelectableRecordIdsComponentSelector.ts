import { isRecordGroupTabsDisplayedComponentSelector } from '@/object-record/record-group/states/selectors/isRecordGroupTabsDisplayedComponentSelector';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordIndexDisplayedRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexDisplayedRecordIdsComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

// Group tabs hide the other groups' rows, so select-all stays on the active tab
export const recordIndexSelectableRecordIdsComponentSelector =
  createAtomComponentSelector<string[]>({
    key: 'recordIndexSelectableRecordIdsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) =>
        get(isRecordGroupTabsDisplayedComponentSelector, { instanceId })
          ? get(recordIndexDisplayedRecordIdsComponentSelector, { instanceId })
          : get(recordIndexAllRecordIdsComponentSelector, { instanceId }),
  });
