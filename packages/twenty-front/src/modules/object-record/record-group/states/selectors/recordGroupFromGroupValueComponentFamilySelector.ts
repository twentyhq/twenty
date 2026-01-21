import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';

import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const recordGroupFromGroupValueComponentFamilySelector =
  createComponentFamilySelector<
    RecordGroupDefinition | undefined,
    { recordGroupValue: Nullable<string> }
  >({
    key: 'recordGroupFromGroupValueComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }): RecordGroupDefinition | undefined => {
        const recordGroupIds = get(
          recordGroupIdsComponentState.atomFamily({
            instanceId,
          }),
        );

        const recordGroupId = recordGroupIds.find((recordGroupId) => {
          const recordGroupDefinition = get(
            recordGroupDefinitionFamilyState(recordGroupId),
          );

          return recordGroupDefinition?.value === familyKey.recordGroupValue;
        });

        if (!isDefined(recordGroupId)) {
          return undefined;
        }

        const recordGroupDefinition = get(
          recordGroupDefinitionFamilyState(recordGroupId),
        );

        return recordGroupDefinition;
      },
  });
