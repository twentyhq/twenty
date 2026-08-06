import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { RecordTableHeaderCheckboxColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCheckboxColumn';
import { RecordTableHeaderDnd } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDnd';
import { RecordTableHeaderDragDropColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDragDropColumn';
import { RecordTableHeaderFirstCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderFirstCell';
import { useResizeTableHeader } from '@/object-record/record-table/record-table-header/hooks/useResizeTableHeader';
import { isRecordTableCheckboxColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableCheckboxColumnHiddenComponentState';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// The virtualized rows are absolutely positioned on a grid whose pitch is
// RECORD_TABLE_ROW_HEIGHT + 1 (row plus its bottom border), with the header
// taking the first slot. Header cells are sized RECORD_TABLE_ROW_HEIGHT with
// their border inside, so without this the body sits one pixel above the grid
// and the add-new row paints over the last row's bottom border.
const StyledHeaderContainer = styled.div`
  background-color: ${themeCssVariables.background.primary};
  box-shadow: 0 -1px 0 ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: row;
  height: ${RECORD_TABLE_ROW_HEIGHT + 1}px;
  position: sticky;
  top: 0;
  z-index: ${TABLE_Z_INDEX.headerRow};
`;

export const RecordTableHeader = () => {
  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden = useAtomComponentStateValue(
    isRecordTableCheckboxColumnHiddenComponentState,
  );

  useResizeTableHeader();

  return (
    <StyledHeaderContainer>
      {!isRecordTableDragColumnHidden && <RecordTableHeaderDragDropColumn />}
      {!isRecordTableCheckboxColumnHidden && (
        <RecordTableHeaderCheckboxColumn />
      )}
      <RecordTableHeaderFirstCell />
      <RecordTableHeaderDnd />
    </StyledHeaderContainer>
  );
};
