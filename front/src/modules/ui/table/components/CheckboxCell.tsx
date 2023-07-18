import { useCallback } from 'react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';

import { Checkbox } from '@/ui/input/components/Checkbox';

import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';
import { contextMenuPositionState } from '../states/contextMenuPositionState';

const StyledContainer = styled.div`
  align-items: center;
  cursor: pointer;

  display: flex;
  height: 32px;

  justify-content: center;
`;

export function CheckboxCell() {
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);

  const { currentRowSelected, setCurrentRowSelected } = useCurrentRowSelected();

  const handleClick = useCallback(() => {
    setCurrentRowSelected(!currentRowSelected);
    setContextMenuPosition({ x: null, y: null });
  }, [currentRowSelected, setContextMenuPosition, setCurrentRowSelected]);

  return (
    <StyledContainer onClick={handleClick}>
      <Checkbox checked={currentRowSelected} onChange={() => undefined} />
    </StyledContainer>
  );
}
