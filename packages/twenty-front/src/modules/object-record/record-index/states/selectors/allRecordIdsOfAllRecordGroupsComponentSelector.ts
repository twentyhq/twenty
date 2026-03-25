import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const allRecordIdsOfAllRecordGroupsComponentSelector =
  createAtomComponentSelector<string[]>({
    key: 'allRecordIdsOfAllRecordGroupsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const recordGroupIds = get(recordGroupIdsComponentState, {
          instanceId,
        });

        if (recordGroupIds.length === 0) {
          return [];
        }

        return recordGroupIds.reduce<string[]>((acc, recordGroupId) => {
          const rowIds = get(recordIndexRecordIdsByGroupComponentFamilyState, {
            instanceId,
            familyKey: recordGroupId,
          });

          return [...acc, ...rowIds];
        }, []);
      },
  });
