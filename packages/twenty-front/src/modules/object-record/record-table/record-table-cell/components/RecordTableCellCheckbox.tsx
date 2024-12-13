import styled from '@emotion/styled';
import { useCallback } from 'react';

import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { useSetCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useSetCurrentRowSelected';
import { Checkbox } from 'twenty-ui';

const StyledContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: center;
  min-width: 24px;
`;

export const RecordTableCellCheckbox = () => {
  const { isSelected } = useRecordTableRowContextOrThrow();

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
