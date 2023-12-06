import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { tableRowIdsState } from '@/ui/object/record-table/states/tableRowIdsState';
import { getRecordTableScopedStates } from '@/ui/object/record-table/utils/getRecordTableScopedStates';

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

export const RecordTableRow = ({ rowId }: RecordTableRowProps) => {
  const { visibleTableColumnsSelector, scopeId } = useRecordTableScopedStates();

  const onLastRowVisible = useRecoilCallback(
    ({ set }) =>
      async (inView: boolean) => {
        const { tableLastRowVisibleState } = getRecordTableScopedStates({
          recordTableScopeId: scopeId,
        });

        set(tableLastRowVisibleState, inView);
      },
    [scopeId],
  );

  const tableRowIds = useRecoilValue(tableRowIdsState);
  const lastRowId = tableRowIds[tableRowIds.length - 1];

  const { ref: lastTableRowRef } = useInView({
    onChange: onLastRowVisible,
  });

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector);

  const { currentRowSelected } = useCurrentRowSelected();

  return (
    <StyledRow
      ref={rowId === lastRowId ? lastTableRowRef : undefined}
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
};
