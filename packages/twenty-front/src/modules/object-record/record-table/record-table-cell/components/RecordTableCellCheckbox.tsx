import styled from '@emotion/styled';
import { useCallback } from 'react';

import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { useSetCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useSetCurrentRowSelected';
import { isDefined } from 'twenty-shared/utils';
import { Checkbox } from 'twenty-ui/input';

export const TABLE_CELL_CHECKBOX_MIN_WIDTH = '24px';

const StyledContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: center;
  min-width: ${TABLE_CELL_CHECKBOX_MIN_WIDTH};
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledRecordTableTd = styled(RecordTableTd)`
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
    <StyledRecordTableTd isSelected={isSelected} hasRightBorder={false}>
      <StyledContainer onClick={handleClick} data-select-disable>
        <Checkbox hoverable checked={isSelected} />
      </StyledContainer>
    </StyledRecordTableTd>
  );
};
