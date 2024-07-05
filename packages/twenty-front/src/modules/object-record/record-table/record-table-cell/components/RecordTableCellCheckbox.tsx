import styled from '@emotion/styled';
import { useCallback, useContext } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { useSetCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useSetCurrentRowSelected';
import { Checkbox } from '@/ui/input/components/Checkbox';
import { actionBarOpenState } from '@/ui/navigation/action-bar/states/actionBarIsOpenState';

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
  const setActionBarOpenState = useSetRecoilState(actionBarOpenState);
  const { setCurrentRowSelected } = useSetCurrentRowSelected();
  const currentRowSelected = useRecoilValue(isRowSelectedFamilyState(recordId));

  const handleClick = useCallback(() => {
    setCurrentRowSelected(!currentRowSelected);
    setActionBarOpenState(true);
  }, [currentRowSelected, setActionBarOpenState, setCurrentRowSelected]);

  return (
    <RecordTableTd isSelected={isSelected} hasRightBorder={false}>
      <StyledContainer onClick={handleClick}>
        <Checkbox checked={currentRowSelected} />
      </StyledContainer>
    </RecordTableTd>
  );
};
