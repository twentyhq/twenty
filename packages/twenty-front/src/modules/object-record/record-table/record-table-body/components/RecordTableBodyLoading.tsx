import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCellCheckbox } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckbox';
import { RecordTableCellGrip } from '@/object-record/record-table/record-table-cell/components/RecordTableCellGrip';
import { RecordTableCellLoading } from '@/object-record/record-table/record-table-cell/components/RecordTableCellLoading';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';

export const RecordTableBodyLoading = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  return (
    <tbody>
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <RecordTableRowContextProvider
          key={rowIndex}
          value={{
            pathToShowPage: '',
            objectNameSingular: '',
            recordId: `${rowIndex}`,
            rowIndex,
            isSelected: false,
            inView: true,
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
            >
              <RecordTableCellGrip />
              <RecordTableCellCheckbox />
              {visibleRecordFields.map((recordField) => (
                <RecordTableCellLoading key={recordField.fieldMetadataItemId} />
              ))}
            </RecordTableTr>
          </RecordTableRowDraggableContextProvider>
        </RecordTableRowContextProvider>
      ))}
    </tbody>
  );
};
