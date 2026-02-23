import { recordGroupFromGroupValueComponentFamilySelector } from '@/object-record/record-group/states/selectors/recordGroupFromGroupValueComponentFamilySelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useStore } from 'jotai';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveRecordsFromBoard = () => {
  const store = useStore();
  const recordIndexGroupFieldMetadataItemCallbackState =
    useRecoilComponentCallbackState(
      recordIndexGroupFieldMetadataItemComponentState,
    );

  const recordGroupFromGroupValueFamilyCallbackState =
    useRecoilComponentCallbackState(
      recordGroupFromGroupValueComponentFamilySelector,
    );

  const recordIndexRecordIdsByGroupFamilyCallbackState =
    useRecoilComponentCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const removeRecordsFromBoard = useRecoilCallback(
    ({ snapshot, set }) =>
      ({ recordIdsToRemove }: { recordIdsToRemove: string[] }) => {
        const recordIdsToRemoveByGroup = new Map<string, string[]>();

        for (const recordIdToRemove of recordIdsToRemove) {
          const recordToRemove = store.get(
            recordStoreFamilyState.atomFamily(recordIdToRemove),
          ) as Record<string, unknown> | null | undefined;

          if (!isDefined(recordToRemove)) {
            continue;
          }

          const recordIndexGroupFieldMetadataItem = getSnapshotValue(
            snapshot,
            recordIndexGroupFieldMetadataItemCallbackState,
          );

          if (!isDefined(recordIndexGroupFieldMetadataItem)) {
            continue;
          }

          const recordGroupValue = recordToRemove[
            recordIndexGroupFieldMetadataItem.name
          ] as string | undefined;

          const recordGroupDefinitionFromGroupValue = getSnapshotValue(
            snapshot,
            recordGroupFromGroupValueFamilyCallbackState({ recordGroupValue }),
          );

          if (!isDefined(recordGroupDefinitionFromGroupValue)) {
            continue;
          }

          const groupId = recordGroupDefinitionFromGroupValue.id;

          if (!recordIdsToRemoveByGroup.has(groupId)) {
            recordIdsToRemoveByGroup.set(groupId, []);
          }

          recordIdsToRemoveByGroup.get(groupId)?.push(recordIdToRemove);
        }

        for (const [
          groupId,
          recordIdsToRemoveInGroup,
        ] of recordIdsToRemoveByGroup) {
          const currentRecordIdsForGroup = getSnapshotValue(
            snapshot,
            recordIndexRecordIdsByGroupFamilyCallbackState(groupId),
          );

          const recordIdsWithoutRemovedRecords =
            currentRecordIdsForGroup.filter(
              (recordId) => !recordIdsToRemoveInGroup.includes(recordId),
            );

          set(
            recordIndexRecordIdsByGroupFamilyCallbackState(groupId),
            recordIdsWithoutRemovedRecords,
          );
        }
      },
    [
      store,
      recordIndexGroupFieldMetadataItemCallbackState,
      recordGroupFromGroupValueFamilyCallbackState,
      recordIndexRecordIdsByGroupFamilyCallbackState,
    ],
  );

  return {
    removeRecordsFromBoard,
  };
};
