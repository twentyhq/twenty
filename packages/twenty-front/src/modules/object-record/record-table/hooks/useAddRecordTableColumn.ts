import { getPositionBetween } from '@/navigation-menu-item/common/utils/getPositionBetween';
import { useUpsertRecordField } from '@/object-record/record-field/hooks/useUpsertRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { v4 } from 'uuid';

export const useAddRecordTableColumn = (recordTableId: string) => {
  const store = useStore();
  const { upsertRecordField } = useUpsertRecordField(recordTableId);
  const { saveViewFields } = useSaveCurrentViewFields();

  const addRecordTableColumn = useCallback(
    async (sourceRecordField: RecordField) => {
      const currentRecordFieldsAtom =
        currentRecordFieldsComponentState.atomFamily({
          instanceId: recordTableId,
        });

      const followingPositions = store
        .get(currentRecordFieldsAtom)
        .map(({ position }) => position)
        .filter((position) => position > sourceRecordField.position);

      const recordFieldToCreate: RecordField = {
        id: v4(),
        fieldMetadataItemId: sourceRecordField.fieldMetadataItemId,
        position: getPositionBetween(
          sourceRecordField.position,
          followingPositions.length > 0
            ? Math.min(...followingPositions)
            : undefined,
        ),
        isVisible: true,
        isCanonical: false,
        size: sourceRecordField.size,
      };

      upsertRecordField(recordFieldToCreate);

      const isSaved = await saveViewFields([
        mapRecordFieldToViewField(recordFieldToCreate),
      ]);

      if (!isSaved) {
        store.set(currentRecordFieldsAtom, (previousRecordFields) =>
          previousRecordFields.filter(
            (recordField) => recordField.id !== recordFieldToCreate.id,
          ),
        );

        return undefined;
      }

      return recordFieldToCreate;
    },
    [recordTableId, saveViewFields, store, upsertRecordField],
  );

  return { addRecordTableColumn };
};
