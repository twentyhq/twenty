import { useContext } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Draggable } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/components/RecordTableCellFieldContextWrapper';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ScrollWrapperContext } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { CheckboxCell } from './CheckboxCell';
import { GripCell } from './GripCell';

type RecordTableRowProps = {
  recordId: string;
  rowIndex: number;
  isPendingRow?: boolean;
};

const StyledTd = styled.td`
  position: relative;
  user-select: none;
`;

const StyledTr = styled.tr<{ isDragging: boolean }>`
  border: 1px solid transparent;
  transition: border-left-color 0.2s ease-in-out;

  td:nth-of-type(-n + 2) {
    background-color: ${({ theme }) => theme.background.primary};
    border-right-color: ${({ theme }) => theme.background.primary};
  }

  ${({ isDragging }) =>
    isDragging &&
    `
    td:nth-of-type(1) {
      background-color: transparent;
      border-color: transparent;
    }

    td:nth-of-type(2) {
      background-color: transparent;
      border-color: transparent;
    }

    td:nth-of-type(3) {
      background-color: transparent;
      border-color: transparent;
    }

  `}
`;

export const RecordTableRow = ({
  recordId,
  rowIndex,
  isPendingRow,
}: RecordTableRowProps) => {
  const { visibleTableColumnsSelector, isRowSelectedFamilyState } =
    useRecordTableStates();
  const currentRowSelected = useRecoilValue(isRowSelectedFamilyState(recordId));
  const { objectMetadataItem } = useContext(RecordTableContext);

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  const scrollWrapperRef = useContext(ScrollWrapperContext);

  const { ref: elementRef, inView } = useInView({
    root: scrollWrapperRef.current?.querySelector(
      '[data-overlayscrollbars-viewport="scrollbarHidden"]',
    ),
    rootMargin: '1000px',
  });

  const theme = useTheme();

  return (
    <RecordTableRowContext.Provider
      value={{
        recordId,
        rowIndex,
        pathToShowPage:
          getBasePathToShowPage({
            objectNameSingular: objectMetadataItem.nameSingular,
          }) + recordId,
        objectNameSingular: objectMetadataItem.nameSingular,
        isSelected: currentRowSelected,
        isReadOnly: objectMetadataItem.isRemote ?? false,
        isPendingRow,
      }}
    >
      <RecordValueSetterEffect recordId={recordId} />

      <Draggable key={recordId} draggableId={recordId} index={rowIndex}>
        {(draggableProvided, draggableSnapshot) => (
          <StyledTr
            ref={(node) => {
              elementRef(node);
              draggableProvided.innerRef(node);
            }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided.draggableProps}
            style={{
              ...draggableProvided.draggableProps.style,
              background: draggableSnapshot.isDragging
                ? theme.background.transparent.light
                : 'none',
              borderColor: draggableSnapshot.isDragging
                ? `${theme.border.color.medium}`
                : 'transparent',
            }}
            isDragging={draggableSnapshot.isDragging}
            data-testid={`row-id-${recordId}`}
            data-selectable-id={recordId}
          >
            <StyledTd
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...draggableProvided.dragHandleProps}
              data-select-disable
            >
              <GripCell isDragging={draggableSnapshot.isDragging} />
            </StyledTd>
            <StyledTd>
              {!draggableSnapshot.isDragging && <CheckboxCell />}
            </StyledTd>
            {inView || draggableSnapshot.isDragging
              ? visibleTableColumns.map((column, columnIndex) => (
                  <RecordTableCellContext.Provider
                    value={{
                      columnDefinition: column,
                      columnIndex,
                    }}
                    key={column.fieldMetadataId}
                  >
                    {draggableSnapshot.isDragging && columnIndex > 0 ? null : (
                      <RecordTableCellFieldContextWrapper />
                    )}
                  </RecordTableCellContext.Provider>
                ))
              : visibleTableColumns.map((column) => (
                  <StyledTd key={column.fieldMetadataId}></StyledTd>
                ))}
            <StyledTd />
          </StyledTr>
        )}
      </Draggable>
    </RecordTableRowContext.Provider>
  );
};
