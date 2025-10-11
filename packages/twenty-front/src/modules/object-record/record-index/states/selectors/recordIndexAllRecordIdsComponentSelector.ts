import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const NO_RECORD_GROUP_FAMILY_KEY = 'record-group-default-id';

export const recordIndexAllRecordIdsComponentSelector = createComponentSelector<
  string[]
>({
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
        return get(
          recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
            instanceId,
            familyKey: NO_RECORD_GROUP_FAMILY_KEY,
          }),
        );
      }

      return recordGroupIds.reduce<ObjectRecord['id'][]>(
        (acc, recordGroupId) => {
          const rowIds = get(
            recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
              instanceId,
              familyKey: recordGroupId,
            }),
          );

          return [...acc, ...rowIds];
        },
        [],
      );
    },
  set:
    ({ instanceId }) =>
    ({ set }, recordIds) =>
      set(
        recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
          instanceId,
          familyKey: NO_RECORD_GROUP_FAMILY_KEY,
        }),
        recordIds,
      ),
});
