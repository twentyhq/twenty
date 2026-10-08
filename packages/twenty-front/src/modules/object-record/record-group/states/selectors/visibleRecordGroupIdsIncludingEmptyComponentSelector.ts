import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordGroupSortedInsert } from '@/object-record/record-group/utils/recordGroupSortedInsert';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

export const visibleRecordGroupIdsIncludingEmptyComponentSelector =
  createAtomComponentSelector<RecordGroupDefinition['id'][]>({
    key: 'visibleRecordGroupIdsIncludingEmptyComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const recordGroupSort = get(recordIndexRecordGroupSortComponentState, {
          instanceId,
        });

        const recordGroupIds = get(recordGroupIdsComponentState, {
          instanceId,
        });

        const result: RecordGroupDefinition[] = [];

        const comparator = (
          a: RecordGroupDefinition,
          b: RecordGroupDefinition,
        ) => {
          switch (recordGroupSort) {
            case RecordGroupSort.Alphabetical:
              return a.title.localeCompare(b.title);
            case RecordGroupSort.ReverseAlphabetical:
              return b.title.localeCompare(a.title);
            case RecordGroupSort.Manual:
            default:
              return a.position - b.position;
          }
        };

        for (const recordGroupId of recordGroupIds) {
          const recordGroupDefinition = get(
            recordGroupDefinitionFamilyState,
            recordGroupId,
          );

          if (!isDefined(recordGroupDefinition)) {
            continue;
          }

          if (!recordGroupDefinition.isVisible) {
            continue;
          }

          recordGroupSortedInsert(result, recordGroupDefinition, comparator);
        }

        return result.map(({ id }) => id);
      },
  });
