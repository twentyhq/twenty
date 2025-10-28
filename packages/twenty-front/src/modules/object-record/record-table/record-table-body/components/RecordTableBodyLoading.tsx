import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { RecordTableCellCheckbox } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckbox';
import { RecordTableCellDragAndDrop } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDragAndDrop';
import { RecordTableCellLoading } from '@/object-record/record-table/record-table-cell/components/RecordTableCellLoading';
import { RecordTableLastEmptyCell } from '@/object-record/record-table/record-table-cell/components/RecordTableLastEmptyCell';
import { RecordTablePlusButtonCellPlaceholder } from '@/object-record/record-table/record-table-cell/components/RecordTablePlusButtonCellPlaceholder';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';

export const RecordTableBodyLoading = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  return (
    <RecordTableBody>
      {Array.from({ length: 80 }).map((_, rowIndex) => (
        <RecordTableRowContextProvider
          key={rowIndex}
          value={{
            pathToShowPage: '',
            objectNameSingular: '',
            recordId: `${rowIndex}`,
            rowIndex,
            isSelected: false,
          }}
        >
          <RecordTableRowDraggableContextProvider
            value={{
              dragHandleProps: {} as any,
              isDragging: false,
            }}
          >
            <RecordTableTr
              recordId={`${rowIndex}`}
              focusIndex={0}
              isDragging={false}
              data-testid={`row-id-${rowIndex}`}
              data-selectable-id={`row-id-${rowIndex}`}
              isFirstRowOfGroup={rowIndex === 0}
            >
              <RecordTableCellDragAndDrop />
              <RecordTableCellCheckbox />
              {visibleRecordFields.map((recordField, index) => (
                <RecordTableCellLoading
                  key={recordField.fieldMetadataItemId}
                  recordFieldIndex={index}
                />
              ))}
              <RecordTablePlusButtonCellPlaceholder />
              <RecordTableLastEmptyCell />
            </RecordTableTr>
          </RecordTableRowDraggableContextProvider>
        </RecordTableRowContextProvider>
      ))}
    </RecordTableBody>
  );
};
