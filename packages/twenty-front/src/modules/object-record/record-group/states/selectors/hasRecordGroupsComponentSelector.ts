import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';

import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const hasRecordGroupsComponentSelector =
  createComponentSelector<boolean>({
    key: 'hasRecordGroupsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const recordGroupIds = get(
          recordGroupIdsComponentState.atomFamily({
            instanceId,
          }),
        );

        return recordGroupIds.length > 0;
      },
  });
