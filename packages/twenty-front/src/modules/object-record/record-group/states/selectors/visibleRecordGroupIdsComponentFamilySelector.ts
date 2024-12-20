import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordGroupSortedInsert } from '@/object-record/record-group/utils/recordGroupSortedInsert';
import { recordIndexRecordGroupHideComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordGroupHideComponentFamilyState';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { createComponentFamilySelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelectorV2';

import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewType } from '@/views/types/ViewType';
import { isDefined } from '~/utils/isDefined';

export const visibleRecordGroupIdsComponentFamilySelector =
  createComponentFamilySelectorV2<RecordGroupDefinition['id'][], ViewType>({
    key: 'visibleRecordGroupIdsComponentFamilySelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
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
        const hideEmptyRecordGroup = get(
          recordIndexRecordGroupHideComponentFamilyState.atomFamily({
            instanceId,
            familyKey,
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
          const recordIds = get(
            recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
              instanceId,
              familyKey: recordGroupId,
            }),
          );

          if (!isDefined(recordGroupDefinition)) {
            continue;
          }

          if (hideEmptyRecordGroup && recordIds.length === 0) {
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
