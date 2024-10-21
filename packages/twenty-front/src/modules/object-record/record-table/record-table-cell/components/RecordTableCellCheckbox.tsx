import styled from '@emotion/styled';
import { useCallback, useContext } from 'react';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { useSetCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useSetCurrentRowSelected';
import { Checkbox } from '@/ui/input/components/Checkbox';

const StyledContainer = styled.div`
  align-items: center;
  cursor: pointer;

  display: flex;
  height: 32px;

  justify-content: center;
`;

export const RecordTableCellCheckbox = () => {
  const { isSelected } = useContext(RecordTableRowContext);

  const { setCurrentRowSelected } = useSetCurrentRowSelected();

  const handleClick = useCallback(() => {
    setCurrentRowSelected(!isSelected);
  }, [isSelected, setCurrentRowSelected]);

  return (
    <RecordTableTd isSelected={isSelected} hasRightBorder={false}>
      <StyledContainer onClick={handleClick}>
        <Checkbox hoverable checked={isSelected} />
      </StyledContainer>
    </RecordTableTd>
  );
};
