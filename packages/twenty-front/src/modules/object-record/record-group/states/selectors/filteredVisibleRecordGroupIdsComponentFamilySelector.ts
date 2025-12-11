import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type ViewType } from '@/views/types/ViewType';

export const filteredVisibleRecordGroupIdsComponentFamilySelector =
  createComponentFamilySelector<RecordGroupDefinition['id'][], ViewType>({
    key: 'filteredVisibleRecordGroupIdsComponentFamilySelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) => {
        const visibleRecordGroupIds = get(
          visibleRecordGroupIdsComponentFamilySelector.selectorFamily({
            instanceId,
            familyKey,
          }),
        );

        const shouldHideEmptyRecordGroups = get(
          recordIndexShouldHideEmptyRecordGroupsComponentState.atomFamily({
            instanceId,
          }),
        );

        if (!shouldHideEmptyRecordGroups) {
          return visibleRecordGroupIds;
        }

        return visibleRecordGroupIds.filter((recordGroupId) => {
          const recordIdsByGroup = get(
            recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
              instanceId,
              familyKey: recordGroupId,
            }),
          );

          return recordIdsByGroup.length > 0;
        });
      },
  });
