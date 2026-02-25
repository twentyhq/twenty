import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

export const hiddenRecordGroupIdsComponentSelector =
  createAtomComponentSelector<RecordGroupDefinition['id'][]>({
    key: 'hiddenRecordGroupIdsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const recordGroupIds = get(recordGroupIdsComponentState, {
          instanceId,
        });

        return recordGroupIds.filter((recordGroupId) => {
          const recordGroupDefinition = get(
            recordGroupDefinitionFamilyState,
            recordGroupId,
          );

          if (!isDefined(recordGroupDefinition)) {
            return false;
          }

          return !recordGroupDefinition.isVisible;
        });
      },
  });
