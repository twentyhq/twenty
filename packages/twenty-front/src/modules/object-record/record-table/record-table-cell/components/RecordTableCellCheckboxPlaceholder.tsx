import styled from '@emotion/styled';

import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidthClassName';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { Checkbox } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  justify-content: center;
  min-width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH};
  width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH};
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

// TODO: refactor
const StyledRecordTableTd = styled(RecordTableCellStyleWrapper)`
  border-left: 1px solid transparent;
`;

export const RecordTableCellCheckboxPlaceholder = () => {
  const { hasUserSelectedAllRows } = useRecordTableBodyContextOrThrow();

  return (
    <StyledRecordTableTd
      isSelected={hasUserSelectedAllRows}
      hasRightBorder={false}
      widthClassName={RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME}
    >
      <StyledContainer data-select-disable>
        <Checkbox hoverable checked={hasUserSelectedAllRows === true} />
      </StyledContainer>
    </StyledRecordTableTd>
  );
};
