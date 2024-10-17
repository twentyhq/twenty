import styled from '@emotion/styled';
import { useCallback, useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
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

  const { recordId } = useContext(RecordTableRowContext);
  const { isRowSelectedFamilyState } = useRecordTableStates();
  const { setCurrentRowSelected } = useSetCurrentRowSelected();
  const currentRowSelected = useRecoilValue(isRowSelectedFamilyState(recordId));

  const handleClick = useCallback(() => {
    setCurrentRowSelected(!currentRowSelected);
  }, [currentRowSelected, setCurrentRowSelected]);

  return (
    <RecordTableTd isSelected={isSelected} hasRightBorder={false}>
      <StyledContainer onClick={handleClick}>
        <Checkbox hoverable checked={currentRowSelected} />
      </StyledContainer>
    </RecordTableTd>
  );
};
