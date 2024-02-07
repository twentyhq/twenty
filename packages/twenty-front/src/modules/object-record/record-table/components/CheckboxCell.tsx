import { useCallback, useContext } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
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

export const CheckboxCell = () => {
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
    <StyledContainer onClick={handleClick}>
      <Checkbox checked={currentRowSelected} />
    </StyledContainer>
  );
};
