import { RecordTableCellCheckbox } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckbox';
import { RecordTableCellGrip } from '@/object-record/record-table/record-table-cell/components/RecordTableCellGrip';
import { RecordTableCellLoading } from '@/object-record/record-table/record-table-cell/components/RecordTableCellLoading';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTableBodyLoading = () => {
  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
  );

  return (
    <tbody>
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <RecordTableTr
          isDragging={false}
          data-testid={`row-id-${rowIndex}`}
          data-selectable-id={`row-id-${rowIndex}`}
          key={rowIndex}
        >
          <RecordTableCellGrip />
          <RecordTableCellCheckbox />
          {visibleTableColumns.map((column) => (
            <RecordTableCellLoading key={column.fieldMetadataId} />
          ))}
        </RecordTableTr>
      ))}
    </tbody>
  );
};
