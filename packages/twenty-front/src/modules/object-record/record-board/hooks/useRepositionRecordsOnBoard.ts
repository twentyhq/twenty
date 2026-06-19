import { useStore } from 'jotai';

import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const useRepositionRecordsOnBoard = () => {
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const recordGroupDefinitionsCallbackState =
    useAtomComponentSelectorCallbackState(
      recordGroupDefinitionsComponentSelector,
    );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateCallbackState(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordIndexRecordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const repositionRecordsOnBoard = useCallback(
    (updateInputs: ObjectRecordOperationUpdateInput[]): boolean => {
      const groupFieldMetadataItem = store.get(
        recordIndexGroupFieldMetadataItem,
      );

      if (!isDefined(groupFieldMetadataItem)) {
        return false;
      }

      const groupFieldName = groupFieldMetadataItem.name;
      const recordGroupDefinitions = store.get(
        recordGroupDefinitionsCallbackState,
      );

      // Column membership changes are accumulated here and committed only once
      // the whole batch succeeds: a mid-batch bail-out leaves the columns
      // untouched and the caller re-runs the board query.
      const updatedRecordIdsByGroupId: Record<string, string[]> = {};

      const getRecordIdsForGroup = (recordGroupId: string): string[] =>
        updatedRecordIdsByGroupId[recordGroupId] ??
        store.get(recordIndexRecordIdsByGroupCallbackState(recordGroupId));

      for (const updateInput of updateInputs) {
        const recordId = updateInput.recordId;

        const currentRecord = store.get(
          recordStoreFamilyState.atomFamily(recordId),
        );

        if (!isDefined(currentRecord)) {
          return false;
        }

        const updatedFields: Record<string, unknown> = {};

        for (const updatedField of updateInput.updatedFields) {
          Object.assign(updatedFields, updatedField ?? {});
        }

        const sourceRecordGroup = recordGroupDefinitions.find(
          (recordGroupDefinition) =>
            getRecordIdsForGroup(recordGroupDefinition.id).includes(recordId),
        );

        if (!isDefined(sourceRecordGroup)) {
          return false;
        }

        const targetRecordGroup =
          groupFieldName in updatedFields
            ? recordGroupDefinitions.find(
                (recordGroupDefinition) =>
                  recordGroupDefinition.value === updatedFields[groupFieldName],
              )
            : sourceRecordGroup;

        if (!isDefined(targetRecordGroup)) {
          return false;
        }

        // Upsert in place so extractRecordPositions reads the new position when
        // several records in the same batch land in the same column.
        upsertRecordsInStore({
          partialRecords: [
            {
              ...currentRecord,
              ...updatedFields,
              id: recordId,
            },
          ],
        });

        if (sourceRecordGroup.id !== targetRecordGroup.id) {
          updatedRecordIdsByGroupId[sourceRecordGroup.id] =
            getRecordIdsForGroup(sourceRecordGroup.id).filter(
              (id) => id !== recordId,
            );
        }

        const targetRecordIdsWithoutRecord = getRecordIdsForGroup(
          targetRecordGroup.id,
        ).filter((id) => id !== recordId);

        const targetRecordsWithPositions = extractRecordPositions(
          [...targetRecordIdsWithoutRecord, recordId],
          store,
        );

        targetRecordsWithPositions.sort(sortByProperty('position', 'asc'));

        updatedRecordIdsByGroupId[targetRecordGroup.id] =
          targetRecordsWithPositions.map((record) => record.id);
      }

      for (const [recordGroupId, recordIds] of Object.entries(
        updatedRecordIdsByGroupId,
      )) {
        store.set(
          recordIndexRecordIdsByGroupCallbackState(recordGroupId),
          recordIds,
        );
      }

      return true;
    },
    [
      store,
      upsertRecordsInStore,
      recordGroupDefinitionsCallbackState,
      recordIndexGroupFieldMetadataItem,
      recordIndexRecordIdsByGroupCallbackState,
    ],
  );

  return {
    repositionRecordsOnBoard,
  };
};
