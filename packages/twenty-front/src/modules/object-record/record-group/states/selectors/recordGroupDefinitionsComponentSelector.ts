import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

export const recordGroupDefinitionsComponentSelector = createComponentSelector<
  RecordGroupDefinition[]
>({
  key: 'recordGroupDefinitionsComponentSelector',
  componentInstanceContext: ViewComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const recordGroupIds = get(
        recordGroupIdsComponentState.atomFamily({
          instanceId,
        }),
      );

      return recordGroupIds.reduce<RecordGroupDefinition[]>(
        (acc, recordGroupId) => {
          const recordGroupDefinition = get(
            recordGroupDefinitionFamilyState(recordGroupId),
          );

          if (!isDefined(recordGroupDefinition)) {
            return acc;
          }

          return [...acc, recordGroupDefinition];
        },
        [],
      );
    },
});
