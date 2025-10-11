import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const allRecordIdsOfAllRecordGroupsComponentSelector =
  createComponentSelector<string[]>({
    key: 'recordIndexAllRecordIdsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const recordGroupIds = get(
          recordGroupIdsComponentState.atomFamily({
            instanceId,
          }),
        );

        if (recordGroupIds.length === 0) {
          return [];
        }

        return recordGroupIds.reduce<string[]>((acc, recordGroupId) => {
          const rowIds = get(
            recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
              instanceId,
              familyKey: recordGroupId,
            }),
          );

          return [...acc, ...rowIds];
        }, []);
      },
  });
