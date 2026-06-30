import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordGroupSortedInsert } from '@/object-record/record-group/utils/recordGroupSortedInsert';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

export const availableRecordGroupIdsComponentSelector =
  createAtomComponentSelector<RecordGroupDefinition['id'][]>({
    key: 'availableRecordGroupIdsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const recordGroupIds = get(recordGroupIdsComponentState, {
          instanceId,
        });

        const result: RecordGroupDefinition[] = [];

        for (const recordGroupId of recordGroupIds) {
          const recordGroupDefinition = get(
            recordGroupDefinitionFamilyState,
            recordGroupId,
          );

          if (!isDefined(recordGroupDefinition)) {
            continue;
          }

          if (
            recordGroupDefinition.type === RecordGroupDefinitionType.NoValue
          ) {
            continue;
          }

          recordGroupSortedInsert(result, recordGroupDefinition, (a, b) =>
            a.title.localeCompare(b.title),
          );
        }

        return result.map(({ id }) => id);
      },
  });
