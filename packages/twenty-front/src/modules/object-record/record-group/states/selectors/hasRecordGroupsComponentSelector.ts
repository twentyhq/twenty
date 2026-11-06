import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { isAllRecordGroupsTabActiveComponentSelector } from '@/object-record/record-group/states/selectors/isAllRecordGroupsTabActiveComponentSelector';

import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const hasRecordGroupsComponentSelector =
  createAtomComponentSelector<boolean>({
    key: 'hasRecordGroupsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const recordGroupIds = get(recordGroupIdsComponentState, {
          instanceId,
        });

        // The All tab shows the view ungrouped
        return (
          recordGroupIds.length > 0 &&
          !get(isAllRecordGroupsTabActiveComponentSelector, { instanceId })
        );
      },
  });
