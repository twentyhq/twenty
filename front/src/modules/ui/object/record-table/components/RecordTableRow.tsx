import { forwardRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { tableColumnWidthsState } from '@/ui/object/record-table/states/tableColumnWidths';

import { ColumnContext } from '../contexts/ColumnContext';
import { useRecordTableScopedStates } from '../hooks/internal/useRecordTableScopedStates';
import { useCurrentRowSelected } from '../record-table-row/hooks/useCurrentRowSelected';

import { CheckboxCell } from './CheckboxCell';
import { RecordTableCell } from './RecordTableCell';

export const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.accent.quaternary : 'none'};
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

type RecordTableRowProps = {
  rowId: string;
  style?: React.CSSProperties;
};

export const RecordTableRow = forwardRef<
  HTMLTableRowElement,
  RecordTableRowProps
>(({ rowId, style }, ref) => {
  const { visibleTableColumnsSelector } = useRecordTableScopedStates();

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector);

  const { currentRowSelected } = useCurrentRowSelected();

  const tableColumnWidths = useRecoilValue(tableColumnWidthsState);

  return (
    <StyledRow
      ref={ref}
      data-testid={`row-id-${rowId}`}
      selected={currentRowSelected}
      data-selectable-id={rowId}
      style={style}
    >
      <td style={{ width: tableColumnWidths[0], height: style?.height }}>
        <CheckboxCell />
      </td>
      {[...visibleTableColumns]
        .sort((columnA, columnB) => columnA.position - columnB.position)
        .map((column, columnIndex) => {
          return (
            <ColumnContext.Provider value={column} key={column.fieldMetadataId}>
              <RecordTableCell
                cellIndex={columnIndex}
                width={tableColumnWidths[columnIndex + 1]}
              />
            </ColumnContext.Provider>
          );
        })}
      <td></td>
    </StyledRow>
  );
});
