import styled from '@emotion/styled';
import { useCallback } from 'react';

import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidthClassName';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { useSetCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useSetCurrentRowSelected';
import { isDefined } from 'twenty-shared/utils';
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

export const RecordTableCellCheckbox = () => {
  const { isSelected } = useRecordTableRowContextOrThrow();

  const { setCurrentRowSelected } = useSetCurrentRowSelected();

  const handleClick = useCallback(
    (event?: React.MouseEvent<HTMLDivElement>) => {
      setCurrentRowSelected({
        newSelectedState: !isSelected,
        shouldSelectRange: isDefined(event?.shiftKey) && event.shiftKey,
      });
    },
    [isSelected, setCurrentRowSelected],
  );

  return (
    <StyledRecordTableTd
      isSelected={isSelected}
      hasRightBorder={false}
      widthClassName={RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME}
    >
      <StyledContainer onClick={handleClick} data-select-disable>
        <Checkbox hoverable checked={isSelected} />
      </StyledContainer>
    </StyledRecordTableTd>
  );
};
