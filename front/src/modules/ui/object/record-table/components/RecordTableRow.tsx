import { forwardRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { ColumnContext } from '../contexts/ColumnContext';
import { useRecordTableScopedStates } from '../hooks/internal/useRecordTableScopedStates';
import { useCurrentRowSelected } from '../record-table-row/hooks/useCurrentRowSelected';

import { CheckboxCell } from './CheckboxCell';
import { RecordTableCell } from './RecordTableCell';

export const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.accent.quaternary : 'none'};
`;

type RecordTableRowProps = {
  rowId: string;
};

export const RecordTableRow = forwardRef<
  HTMLTableRowElement,
  RecordTableRowProps
>(({ rowId }, ref) => {
  const { visibleTableColumnsSelector } = useRecordTableScopedStates();

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector);

  const { currentRowSelected } = useCurrentRowSelected();

  return (
    <StyledRow
      ref={ref}
      data-testid={`row-id-${rowId}`}
      selected={currentRowSelected}
      data-selectable-id={rowId}
    >
      <td>
        <CheckboxCell />
      </td>
      {[...visibleTableColumns]
        .sort((columnA, columnB) => columnA.position - columnB.position)
        .map((column, columnIndex) => {
          return (
            <ColumnContext.Provider value={column} key={column.fieldMetadataId}>
              <RecordTableCell cellIndex={columnIndex} />
            </ColumnContext.Provider>
          );
        })}
      <td></td>
    </StyledRow>
  );
});
