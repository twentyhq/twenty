import { useCallback } from 'react';

import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useUnfocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useUnfocusRecordTableCell';

import { useCreateTableColumn } from '@/object-record/record-field/hooks/useCreateTableColumn';
import { useMoveRecordField } from '@/object-record/record-field/hooks/useMoveRecordField';
import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { useUpdateTableColumn } from '@/object-record/record-field/hooks/useUpdateTableColumn';
import { useUpsertRecordField } from '@/object-record/record-field/hooks/useUpsertRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useHandleColumnsChange } from '@/object-record/record-table/hooks/useHandleColumnsChange';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { sortByProperty } from '~/utils/array/sortByProperty';
import { type ColumnDefinition } from '../types/ColumnDefinition';

type useRecordTableProps = {
  recordTableId: string;
};

export const useTableColumns = ({ recordTableId }: useRecordTableProps) => {
  const currentRecordFields = useRecoilComponentValue(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const { unfocusRecordTableCell } = useUnfocusRecordTableCell(recordTableId);

  const { handleColumnsChange } = useHandleColumnsChange();

  const { updateRecordField } = useUpdateRecordField(recordTableId);
  const { upsertRecordField } = useUpsertRecordField(recordTableId);

  const { saveViewFields } = useSaveCurrentViewFields();

  const { updateTableColumn } = useUpdateTableColumn(recordTableId);
  const { createTableColumn } = useCreateTableColumn(recordTableId);

  const handleColumnVisibilityChange = useCallback(
    async (
      viewField: Pick<
        ColumnDefinition<FieldMetadata>,
        'fieldMetadataId' | 'isVisible'
      >,
    ) => {
      const lastPosition = currentRecordFields.toSorted(
        sortByProperty('position', 'desc'),
      )[0].position;

      const shouldShowFieldMetadataItem = viewField.isVisible === true;
      const corresponingRecordField = currentRecordFields.find(
        (recordFieldToFind) =>
          recordFieldToFind.fieldMetadataItemId === viewField.fieldMetadataId,
      );

      const noExistingRecordField = !isDefined(corresponingRecordField);

      if (noExistingRecordField) {
        const recordFieldToUpsert: RecordField = {
          id: v4(),
          fieldMetadataItemId: viewField.fieldMetadataId,
          size: 100,
          isVisible: shouldShowFieldMetadataItem,
          position: lastPosition + 1,
        };

        upsertRecordField(recordFieldToUpsert);

        createTableColumn(viewField.fieldMetadataId, {
          position: lastPosition + 1,
          size: 100,
          isVisible: shouldShowFieldMetadataItem,
        });

        saveViewFields([mapRecordFieldToViewField(recordFieldToUpsert)]);
      } else {
        updateRecordField(viewField.fieldMetadataId, {
          isVisible: shouldShowFieldMetadataItem,
        });

        const updatedRecordField: RecordField = {
          ...corresponingRecordField,
          isVisible: shouldShowFieldMetadataItem,
        };

        updateTableColumn(viewField.fieldMetadataId, {
          isVisible: shouldShowFieldMetadataItem,
        });

        saveViewFields([mapRecordFieldToViewField(updatedRecordField)]);
      }
    },
    [
      updateTableColumn,
      saveViewFields,
      currentRecordFields,
      upsertRecordField,
      updateRecordField,
      createTableColumn,
    ],
  );

  const { moveRecordField } = useMoveRecordField(recordTableId);

  const handleMoveTableColumn = useCallback(
    async (
      direction: 'left' | 'right',
      column: ColumnDefinition<FieldMetadata>,
    ) => {
      unfocusRecordTableCell();

      moveRecordField({
        direction: direction === 'left' ? 'before' : 'after',
        fieldMetadataItemIdToMove: column.fieldMetadataId,
      });
    },
    [unfocusRecordTableCell, moveRecordField],
  );

  return {
    handleColumnVisibilityChange,
    handleMoveTableColumn,
    handleColumnsChange,
  };
};
