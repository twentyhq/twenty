import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const recordGroupFromGroupValueComponentFamilySelector =
  createAtomComponentFamilySelector<
    RecordGroupDefinition | undefined,
    { recordGroupValue: Nullable<string> }
  >({
    key: 'recordGroupFromGroupValueComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }): RecordGroupDefinition | undefined => {
        const recordGroupIds = get(recordGroupIdsComponentState, {
          instanceId,
        });

        const recordGroupId = recordGroupIds.find((id) => {
          const recordGroupDefinition = get(
            recordGroupDefinitionFamilyState,
            id,
          );

          return recordGroupDefinition?.value === familyKey.recordGroupValue;
        });

        if (!isDefined(recordGroupId)) {
          return undefined;
        }

        const recordGroupDefinition = get(
          recordGroupDefinitionFamilyState,
          recordGroupId,
        );

        return recordGroupDefinition;
      },
  });
