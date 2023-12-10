import { useCallback } from 'react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';

import { Checkbox } from '@/ui/input/components/Checkbox';
import { actionBarOpenState } from '@/ui/navigation/action-bar/states/actionBarIsOpenState';

import { useCurrentRowSelected } from '../record-table-row/hooks/useCurrentRowSelected';

const StyledContainer = styled.div`
  align-items: center;
  cursor: pointer;

  display: flex;
  height: 32px;

  justify-content: center;
`;

export const CheckboxCell = () => {
  const setActionBarOpenState = useSetRecoilState(actionBarOpenState);
  const { currentRowSelected, setCurrentRowSelected } = useCurrentRowSelected();

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
