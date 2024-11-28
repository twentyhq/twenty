import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';

import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from '~/utils/isDefined';

export const hiddenRecordGroupIdsComponentSelector = createComponentSelectorV2<
  string[]
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
