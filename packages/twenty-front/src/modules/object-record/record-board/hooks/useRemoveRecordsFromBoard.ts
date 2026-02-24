import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { recordGroupFromGroupValueComponentFamilySelector } from '@/object-record/record-group/states/selectors/recordGroupFromGroupValueComponentFamilySelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useStore } from 'jotai';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentFamilySelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilySelectorCallbackStateV2';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveRecordsFromBoard = () => {
  const store = useStore();
  const recordIndexGroupFieldMetadataItemAtom =
    useRecoilComponentStateCallbackStateV2(
      recordIndexGroupFieldMetadataItemComponentState,
    );

  const recordGroupFromGroupValueFamilyCallbackState =
    useRecoilComponentFamilySelectorCallbackStateV2(
      recordGroupFromGroupValueComponentFamilySelector,
    );

  const recordIndexRecordIdsByGroupFamilyCallbackState =
    useRecoilComponentFamilyStateCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const removeRecordsFromBoard = useCallback(
    ({ recordIdsToRemove }: { recordIdsToRemove: string[] }) => {
      const recordIdsToRemoveByGroup = new Map<string, string[]>();

      for (const recordIdToRemove of recordIdsToRemove) {
        const recordToRemove = store.get(
          recordStoreFamilyState.atomFamily(recordIdToRemove),
        ) as Record<string, unknown> | null | undefined;

        if (!isDefined(recordToRemove)) {
          continue;
        }

        const recordIndexGroupFieldMetadataItem = store.get(
          recordIndexGroupFieldMetadataItemAtom,
        ) as FieldMetadataItem | undefined;

        if (!isDefined(recordIndexGroupFieldMetadataItem)) {
          continue;
        }

        const recordGroupValue = recordToRemove[
          recordIndexGroupFieldMetadataItem.name
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
        ) as string[];

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
      recordIndexGroupFieldMetadataItemAtom,
      recordGroupFromGroupValueFamilyCallbackState,
      recordIndexRecordIdsByGroupFamilyCallbackState,
    ],
  );

  return {
    removeRecordsFromBoard,
  };
};
