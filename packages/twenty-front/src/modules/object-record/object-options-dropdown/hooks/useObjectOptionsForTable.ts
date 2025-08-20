import { type OnDragEndResponder } from '@hello-pangea/dnd';

import { useFilterVisibleAndReadableRecordField } from '@/object-record/record-field/hooks/useFilterVisibleAndReadableRecordField';
import { useReorderVisibleRecordFields } from '@/object-record/record-field/hooks/useReorderVisibleRecordFields';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useSetTableColumns } from '@/object-record/record-table/hooks/useSetTableColumns';
import { useTableColumns } from '@/object-record/record-table/hooks/useTableColumns';
import { hiddenTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/hiddenTableColumnsComponentSelector';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const useObjectOptionsForTable = (
  recordTableId: string,
  objectMetadataId: string,
) => {
  const hiddenTableColumns = useRecoilComponentValue(
    hiddenTableColumnsComponentSelector,
    recordTableId,
  );

  const tableColumns = useRecoilComponentValue(
    tableColumnsComponentState,
    recordTableId,
  );

  const currentRecordFields = useRecoilComponentValue(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const { filterVisibleAndReadableRecordField } =
    useFilterVisibleAndReadableRecordField();

  const visibleRecordFields = currentRecordFields
    .filter(filterVisibleAndReadableRecordField)
    .toSorted(sortByProperty('position'));

  const { handleColumnVisibilityChange } = useTableColumns({
    recordTableId,
  });

  const { reorderVisibleRecordFields } =
    useReorderVisibleRecordFields(recordTableId);

  const { saveViewFields } = useSaveCurrentViewFields();

  const { setTableColumns } = useSetTableColumns();

  const handleReorderColumns: OnDragEndResponder = useRecoilCallback(
    () => async (result) => {
      if (
        !result.destination ||
        result.destination.index === 1 ||
        result.source.index === 1
      ) {
        return;
      }

      const updatedRecordField = reorderVisibleRecordFields({
        fromIndex: result.source.index - 1,
        toIndex: result.destination.index - 1,
      });

      saveViewFields([mapRecordFieldToViewField(updatedRecordField)]);

      // TODO: remove this after refactor
      const modifiedVisibleTableColumns = produce(
        tableColumns,
        (draftTableColumns) => {
          const indexToModify = draftTableColumns.findIndex(
            (tableColumnToFind) =>
              tableColumnToFind.fieldMetadataId ===
              updatedRecordField.fieldMetadataItemId,
          );

          if (isDefined(draftTableColumns[indexToModify])) {
            draftTableColumns[indexToModify].position =
              updatedRecordField.position;
          } else {
            throw new Error(
              `Undefined draftTableColumns this should not happen`,
            );
          }
        },
      );

      // TODO: remove after refactor
      setTableColumns(
        modifiedVisibleTableColumns,
        recordTableId,
        objectMetadataId,
      );
    },
    [
      reorderVisibleRecordFields,
      saveViewFields,
      objectMetadataId,
      recordTableId,
      setTableColumns,
      tableColumns,
    ],
  );

  return {
    handleReorderColumns,
    handleColumnVisibilityChange,
    visibleTableColumns: visibleRecordFields,
    hiddenTableColumns,
  };
};
