import { useContext } from 'react';
import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { RecordTableCellContainer } from '@/object-record/record-table/components/RecordTableCellContainer';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ScrollWrapperContext } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { useCurrentRowSelected } from '../record-table-row/hooks/useCurrentRowSelected';

import { CheckboxCell } from './CheckboxCell';

export const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.accent.quaternary : 'none'};
`;

type RecordTableRowProps = {
  rowId: string;
};

const StyledPlaceholder = styled.td`
  height: 30px;
`;

export const RecordTableRow = ({ rowId }: RecordTableRowProps) => {
  const { getVisibleTableColumnsSelector } = useRecordTableStates();

  const visibleTableColumns = useRecoilValue(getVisibleTableColumnsSelector());

  const { currentRowSelected } = useCurrentRowSelected();

  const scrollWrapperRef = useContext(ScrollWrapperContext);

  const { ref: elementRef, inView } = useInView({
    root: scrollWrapperRef.current,
    rootMargin: '1000px',
  });

  return (
    <StyledRow
      ref={elementRef}
      data-testid={`row-id-${rowId}`}
      selected={currentRowSelected}
      data-selectable-id={rowId}
    >
      {inView ? (
        <>
          <td>
            <CheckboxCell />
          </td>
          {[...visibleTableColumns]
            .sort((columnA, columnB) => columnA.position - columnB.position)
            .map((column, columnIndex) => {
              return (
                <RecordTableCellContext.Provider
                  value={{
                    columnDefinition: column,
                    columnIndex,
                  }}
                  key={column.fieldMetadataId}
                >
                  <RecordTableCellContainer />
                </RecordTableCellContext.Provider>
              );
            })}
          <td></td>
        </>
      ) : (
        <StyledPlaceholder />
      )}
    </StyledRow>
  );
};
