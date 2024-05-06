import { useContext } from 'react';
import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';

import { ProfilerWrapper } from '@/debug/profiling/components/ProfilerWrapper';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/components/RecordTableCellFieldContextWrapper';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useSelectedRow } from '@/object-record/record-table/scopes/SelectedRowSelectorContext';
import { ScrollWrapperContext } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { CheckboxCell } from './CheckboxCell';

type RecordTableRowProps = {
  recordId: string;
  rowIndex: number;
};

const StyledTd = styled.td`
  background-color: ${({ theme }) => theme.background.primary};
`;

export const RecordTableRow = ({ recordId, rowIndex }: RecordTableRowProps) => {
  // const { visibleTableColumnsSelector, isRowSelectedFamilyState } =
  //   useRecordTableStates();
  // const currentRowSelected = useRecoilValue(isRowSelectedFamilyState(recordId));

  const isRowSelected = useSelectedRow(recordId);

  const { objectMetadataItem } = useContext(RecordTableContext);

  const { visibleTableColumns } = useContext(RecordTableContext);

  const scrollWrapperRef = useContext(ScrollWrapperContext);

  const { ref: elementRef, inView } = useInView({
    root: scrollWrapperRef.current?.querySelector(
      '[data-overlayscrollbars-viewport="scrollbarHidden"]',
    ),
    rootMargin: '1000px',
  });

  return (
    <ProfilerWrapper id={`row-${rowIndex}`} componentName="RecordTableRow">
      <RecordTableRowContext.Provider
        value={{
          recordId,
          rowIndex,
          pathToShowPage:
            getBasePathToShowPage({
              objectNameSingular: objectMetadataItem.nameSingular,
            }) + recordId,
          isSelected: isRowSelected,
          isReadOnly: objectMetadataItem.isRemote ?? false,
        }}
      >
        <tr
          ref={elementRef}
          data-testid={`row-id-${recordId}`}
          data-selectable-id={recordId}
        >
          <StyledTd>
            <CheckboxCell />
          </StyledTd>
          {inView
            ? visibleTableColumns.map((column, columnIndex) => (
                <ProfilerWrapper
                  id={`cell-${recordId}-${column.fieldMetadataId}`}
                  componentName="RecordTableCell"
                >
                  <RecordTableCellContext.Provider
                    value={{
                      columnDefinition: column,
                      columnIndex,
                    }}
                    key={column.fieldMetadataId}
                  >
                    <RecordTableCellFieldContextWrapper />
                  </RecordTableCellContext.Provider>
                </ProfilerWrapper>
              ))
            : visibleTableColumns.map((column) => (
                <td key={column.fieldMetadataId}></td>
              ))}
          <td></td>
        </tr>
      </RecordTableRowContext.Provider>
    </ProfilerWrapper>
  );
};
