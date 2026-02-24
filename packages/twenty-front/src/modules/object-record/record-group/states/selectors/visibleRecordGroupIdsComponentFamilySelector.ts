import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordGroupSortedInsert } from '@/object-record/record-group/utils/recordGroupSortedInsert';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { createComponentFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilySelectorV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type ViewType } from '@/views/types/ViewType';
import { isDefined } from 'twenty-shared/utils';

export const visibleRecordGroupIdsComponentFamilySelector =
  createComponentFamilySelectorV2<RecordGroupDefinition['id'][], ViewType>({
    key: 'visibleRecordGroupIdsComponentFamilySelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId, familyKey: _viewType }) =>
      ({ get }) => {
        const recordGroupSort = get(recordIndexRecordGroupSortComponentState, {
          instanceId,
        });

        const recordGroupIds = get(recordGroupIdsComponentState, {
          instanceId,
        });

        const shouldHideEmptyRecordGroups = get(
          recordIndexShouldHideEmptyRecordGroupsComponentState,
          { instanceId },
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
            recordGroupDefinitionFamilyState,
            recordGroupId,
          );

          if (!isDefined(recordGroupDefinition)) {
            continue;
          }

          if (!recordGroupDefinition.isVisible) {
            continue;
          }

          if (shouldHideEmptyRecordGroups) {
            const rowIds = get(
              recordIndexRecordIdsByGroupComponentFamilyState,
              { instanceId, familyKey: recordGroupId },
            );
            if (rowIds.length === 0) {
              continue;
            }
          }

          recordGroupSortedInsert(result, recordGroupDefinition, comparator);
        }

        return result.map(({ id }) => id);
      },
  });
