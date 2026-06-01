import { useStore } from 'jotai';

import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
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

      for (const updateInput of updateInputs) {
        const recordId = updateInput.recordId;

        const currentRecord = store.get(
          recordStoreFamilyState.atomFamily(recordId),
        ) as ObjectRecord | null | undefined;

        if (!isDefined(currentRecord)) {
          return false;
        }

        const updatedFields: Record<string, unknown> = {};

        for (const updatedField of updateInput.updatedFields) {
          Object.assign(updatedFields, updatedField);
        }

        const sourceRecordGroupFromBoard = recordGroupDefinitions.find(
          (recordGroupDefinition) =>
            store
              .get(
                recordIndexRecordIdsByGroupCallbackState(
                  recordGroupDefinition.id,
                ),
              )
              .includes(recordId),
        );

        if (!isDefined(sourceRecordGroupFromBoard)) {
          return false;
        }

        const targetRecordGroup =
          groupFieldName in updatedFields
            ? recordGroupDefinitions.find(
                (recordGroupDefinition) =>
                  recordGroupDefinition.value === updatedFields[groupFieldName],
              )
            : sourceRecordGroupFromBoard;

        if (!isDefined(targetRecordGroup)) {
          return false;
        }

        upsertRecordsInStore({
          partialRecords: [
            {
              ...currentRecord,
              ...updatedFields,
              id: recordId,
            },
          ],
        });

        if (sourceRecordGroupFromBoard.id !== targetRecordGroup.id) {
          const sourceRecordIds = store.get(
            recordIndexRecordIdsByGroupCallbackState(
              sourceRecordGroupFromBoard.id,
            ),
          );

          store.set(
            recordIndexRecordIdsByGroupCallbackState(
              sourceRecordGroupFromBoard.id,
            ),
            sourceRecordIds.filter((id) => id !== recordId),
          );
        }

        const targetRecordIdsWithoutRecord = store
          .get(recordIndexRecordIdsByGroupCallbackState(targetRecordGroup.id))
          .filter((id) => id !== recordId);

        const targetRecordsWithPositions = extractRecordPositions(
          [...targetRecordIdsWithoutRecord, recordId],
          store,
        );

        targetRecordsWithPositions.sort(sortByProperty('position', 'asc'));

        store.set(
          recordIndexRecordIdsByGroupCallbackState(targetRecordGroup.id),
          targetRecordsWithPositions.map((record) => record.id),
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
