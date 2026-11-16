import { recordGroupTabRecordCountByGroupIdComponentState } from '@/object-record/record-group/states/recordGroupTabRecordCountByGroupIdComponentState';
import { isRecordGroupTabsDisplayedComponentSelector } from '@/object-record/record-group/states/selectors/isRecordGroupTabsDisplayedComponentSelector';
import { visibleRecordGroupIdsIncludingEmptyComponentSelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsIncludingEmptyComponentSelector';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type ViewType } from '@/views/types/ViewType';
import { isDefined } from 'twenty-shared/utils';

export const visibleRecordGroupIdsComponentFamilySelector =
  createAtomComponentFamilySelector<RecordGroupDefinition['id'][], ViewType>({
    key: 'visibleRecordGroupIdsComponentFamilySelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId, familyKey: _viewType }) =>
      ({ get }) => {
        const visibleRecordGroupIds = get(
          visibleRecordGroupIdsIncludingEmptyComponentSelector,
          { instanceId },
        );

        const shouldHideEmptyRecordGroups = get(
          recordIndexShouldHideEmptyRecordGroupsComponentState,
          { instanceId },
        );

        if (!shouldHideEmptyRecordGroups) {
          return visibleRecordGroupIds;
        }

        if (get(isRecordGroupTabsDisplayedComponentSelector, { instanceId })) {
          const recordCountByGroupId = get(
            recordGroupTabRecordCountByGroupIdComponentState,
            { instanceId },
          );

          if (!isDefined(recordCountByGroupId)) {
            return visibleRecordGroupIds;
          }

          return visibleRecordGroupIds.filter(
            (recordGroupId) => (recordCountByGroupId[recordGroupId] ?? 0) > 0,
          );
        }

        return visibleRecordGroupIds.filter(
          (recordGroupId) =>
            get(recordIndexRecordIdsByGroupComponentFamilyState, {
              instanceId,
              familyKey: recordGroupId,
            }).length > 0,
        );
      },
  });
