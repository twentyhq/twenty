import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

/**
 * Do not use this key outside of this file.
 * This is a temporary key to store the record ids for the default record group.
 */
const defaultFamilyKey = 'record-group-default-id';

export const recordIndexAllRecordIdsComponentSelector =
  createComponentSelectorV2<ObjectRecord['id'][]>({
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
              familyKey: defaultFamilyKey,
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
            familyKey: defaultFamilyKey,
          }),
          recordIds,
        ),
  });
