import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

export const hiddenRecordGroupIdsComponentSelector = createComponentSelector<
  RecordGroupDefinition['id'][]
>({
  key: 'hiddenRecordGroupIdsComponentSelector',
  componentInstanceContext: ViewComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const recordGroupIds = get(
        recordGroupIdsComponentState.atomFamily({
          instanceId,
        }),
      );

      return recordGroupIds.filter((recordGroupId) => {
        const recordGroupDefinition = get(
          recordGroupDefinitionFamilyState(recordGroupId),
        );

        if (!isDefined(recordGroupDefinition)) {
          return false;
        }

        return !recordGroupDefinition.isVisible;
      });
    },
});
