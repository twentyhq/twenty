import { useCallback } from 'react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';

import { Checkbox } from '@/ui/Input/components/Checkbox';
import { actionBarOpenState } from '@/ui/Navigation/Action Bar/states/actionBarIsOpenState';

import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';

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
