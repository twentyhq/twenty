import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const NO_RECORD_GROUP_FAMILY_KEY = 'record-group-default-id';

export const recordIndexAllRecordIdsComponentSelector =
  createAtomComponentSelector<string[]>({
    key: 'recordIndexAllRecordIdsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const recordGroupIds = get(recordGroupIdsComponentState, {
          instanceId,
        });

        if (recordGroupIds.length === 0) {
          return get(recordIndexRecordIdsByGroupComponentFamilyState, {
            instanceId,
            familyKey: NO_RECORD_GROUP_FAMILY_KEY,
          });
        }

        return recordGroupIds.reduce<ObjectRecord['id'][]>(
          (acc, recordGroupId) => {
            const rowIds = get(
              recordIndexRecordIdsByGroupComponentFamilyState,
              {
                instanceId,
                familyKey: recordGroupId,
              },
            );

            return [...acc, ...rowIds];
          },
          [],
        );
      },
  });
