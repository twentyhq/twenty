import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { calcGeneratorDuration } from 'framer-motion';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { filterOutByProperty } from 'twenty-shared/utils';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

export const useReorderColumns = (recordTableId?: string) => {
  const store = useStore();

  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();

  const visibleRecordFieldsCallbackState =
    useAtomComponentSelectorCallbackState(
      visibleRecordFieldsComponentSelector,
      recordTableId,
    );

  const { saveViewFields } = useSaveCurrentViewFields();

  const { updateRecordField } = useUpdateRecordField(recordTableId);

  const reorderColumns = useCallback(
    async ({
      sourceIndex,
      destinationIndex,
    }: {
      sourceIndex: number;
      destinationIndex: number;
    }) => {
      if (sourceIndex === destinationIndex) {
        return;
      }

      console.log(sourceIndex, destinationIndex);

      const draggableFields = store
        .get(visibleRecordFieldsCallbackState)
        .filter(
          filterOutByProperty(
            'fieldMetadataItemId',
            labelIdentifierFieldMetadataItem?.id,
          ),
        );
        // console.log(draggableFields)

      if (
        sourceIndex < 0 ||
        destinationIndex < 0 ||
        sourceIndex >= draggableFields.length ||
        destinationIndex >= draggableFields.length
      ) {
        return;
      }

      const reorderedFields = moveArrayItem(draggableFields, {
        fromIndex: sourceIndex,
        toIndex: destinationIndex,
      });

      // console.log(reorderedFields)

      const orderedPositions = draggableFields.map((field) => field.position);

      const updatedViewFields = reorderedFields
        .map((field, index) => {
          const newPosition = orderedPositions[index];

          if (field.position === newPosition) {
            return null;
          }

          const updatedField = updateRecordField(field.fieldMetadataItemId, {
            position: newPosition,
          });

          return mapRecordFieldToViewField(updatedField);
        })
        .filter((viewField) => viewField !== null);

      if (updatedViewFields.length === 0) {
        return;
      }

      // await saveViewFields(updatedViewFields);
    },
    [
      store,
      visibleRecordFieldsCallbackState,
      labelIdentifierFieldMetadataItem?.id,
      updateRecordField,
      saveViewFields,
    ],
  );

  return { reorderColumns };
};
