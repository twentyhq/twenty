import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createComponentSelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentSelectorV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const NO_RECORD_GROUP_FAMILY_KEY = 'record-group-default-id';

export const recordIndexAllRecordIdsComponentSelector =
  createComponentSelectorV2<string[]>({
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
              { instanceId, familyKey: recordGroupId },
            );

            return [...acc, ...rowIds];
          },
          [],
        );
      },
  });
