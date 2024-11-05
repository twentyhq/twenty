import { useContext, useMemo } from 'react';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { RecordTableCellWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellWrapper';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { resizedFieldKeyComponentState } from '@/object-record/record-table/states/resizedFieldKeyComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';

const COLUMN_MIN_WIDTH = 104;

export const RecordTableCellsVisible = () => {
  const { isSelected, isDragging } = useContext(RecordTableRowContext);

  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
  );
  const resizeFieldOffset = useRecoilComponentValueV2(
    resizeFieldOffsetComponentState,
  );

  const tableColumns = useRecoilComponentValueV2(tableColumnsComponentState);
  const tableColumnsByKey = useMemo(
    () =>
      mapArrayToObject(tableColumns, ({ fieldMetadataId }) => fieldMetadataId),
    [tableColumns],
  );

  const resizedFieldKey = useRecoilComponentValueV2(
    resizedFieldKeyComponentState,
  );
  const tableColumnsAfterFirst = visibleTableColumns.slice(1);

  return (
    <>
      <RecordTableCellWrapper column={visibleTableColumns[0]} columnIndex={0}>
        <RecordTableTd
          isSelected={isSelected}
          isDragging={isDragging}
          width={Math.max(
            tableColumnsByKey[visibleTableColumns[0].fieldMetadataId].size +
              (resizedFieldKey === visibleTableColumns[0].fieldMetadataId
                ? resizeFieldOffset
                : 0) +
              24,
            COLUMN_MIN_WIDTH,
          )}
        >
          <RecordTableCell />
        </RecordTableTd>
      </RecordTableCellWrapper>
      {tableColumnsAfterFirst.map((column, columnIndex) => (
        <RecordTableCellWrapper
          key={column.fieldMetadataId}
          column={column}
          columnIndex={columnIndex + 1}
        >
          <RecordTableTd
            isSelected={isSelected}
            isDragging={isDragging}
            width={Math.max(
              tableColumnsByKey[column.fieldMetadataId].size +
                (resizedFieldKey === column.fieldMetadataId
                  ? resizeFieldOffset
                  : 0) +
                24,
              COLUMN_MIN_WIDTH,
            )}
          >
            <RecordTableCell />
          </RecordTableTd>
        </RecordTableCellWrapper>
      ))}
    </>
  );
};
