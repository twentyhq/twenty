import { recordGroupFromGroupValueComponentFamilySelector } from '@/object-record/record-group/states/selectors/recordGroupFromGroupValueComponentFamilySelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useStore } from 'jotai';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentFamilySelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorCallbackState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveRecordsFromBoard = () => {
  const store = useStore();
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateCallbackState(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordGroupFromGroupValueFamilyCallbackState =
    useAtomComponentFamilySelectorCallbackState(
      recordGroupFromGroupValueComponentFamilySelector,
    );

  const recordIndexRecordIdsByGroupFamilyCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const removeRecordsFromBoard = useCallback(
    ({ recordIdsToRemove }: { recordIdsToRemove: string[] }) => {
      const recordIdsToRemoveByGroup = new Map<string, string[]>();

      for (const recordIdToRemove of recordIdsToRemove) {
        const recordToRemove = store.get(
          recordStoreFamilyState.atomFamily(recordIdToRemove),
        );

        if (!isDefined(recordToRemove)) {
          continue;
        }

        const currentRecordIndexGroupFieldMetadataItem = store.get(
          recordIndexGroupFieldMetadataItem,
        );

        if (!isDefined(currentRecordIndexGroupFieldMetadataItem)) {
          continue;
        }

        const recordGroupValue = recordToRemove[
          currentRecordIndexGroupFieldMetadataItem.name
        ] as string | undefined;

        const recordGroupDefinitionFromGroupValue = store.get(
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
        const currentRecordIdsForGroup = store.get(
          recordIndexRecordIdsByGroupFamilyCallbackState(groupId),
        );

        const recordIdsWithoutRemovedRecords = currentRecordIdsForGroup.filter(
          (recordId) => !recordIdsToRemoveInGroup.includes(recordId),
        );

        store.set(
          recordIndexRecordIdsByGroupFamilyCallbackState(groupId),
          recordIdsWithoutRemovedRecords,
        );
      }
    },
    [
      store,
      recordIndexGroupFieldMetadataItem,
      recordGroupFromGroupValueFamilyCallbackState,
      recordIndexRecordIdsByGroupFamilyCallbackState,
    ],
  );

  return {
    removeRecordsFromBoard,
  };
};
