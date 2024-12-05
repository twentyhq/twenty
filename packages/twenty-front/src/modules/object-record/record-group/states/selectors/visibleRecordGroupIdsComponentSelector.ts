import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordGroupSortedInsert } from '@/object-record/record-group/utils/recordGroupSortedInsert';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';

import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from '~/utils/isDefined';

export const visibleRecordGroupIdsComponentSelector = createComponentSelectorV2<
  RecordGroupDefinition['id'][]
>({
  key: 'visibleRecordGroupIdsComponentSelector',
  componentInstanceContext: ViewComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const recordGroupSort = get(
        recordIndexRecordGroupSortComponentState.atomFamily({
          instanceId,
        }),
      );
      const recordGroupIds = get(
        recordGroupIdsComponentState.atomFamily({
          instanceId,
        }),
      );

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
          recordGroupDefinitionFamilyState(recordGroupId),
        );

        if (
          isDefined(recordGroupDefinition) &&
          recordGroupDefinition.isVisible
        ) {
          recordGroupSortedInsert(result, recordGroupDefinition, comparator);
        }
      }

      return result.map(({ id }) => id);
    },
});
