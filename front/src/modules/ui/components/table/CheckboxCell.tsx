import * as React from 'react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';

import { useCurrentRowSelected } from '@/ui/tables/hooks/useCurrentRowSelected';
import { contextMenuPositionState } from '@/ui/tables/states/contextMenuPositionState';

import { Checkbox } from '../form/Checkbox';

const StyledContainer = styled.div`
  align-items: center;

  display: flex;
  height: 32px;

  justify-content: center;
`;

export function CheckboxCell() {
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);

  const { currentRowSelected, setCurrentRowSelected } = useCurrentRowSelected();

  function handleContainerClick() {
    handleCheckboxChange(!currentRowSelected);
  }

  function handleCheckboxChange(newCheckedValue: boolean) {
    setCurrentRowSelected(newCheckedValue);

    setContextMenuPosition({ x: null, y: null });
  }

  return (
    <StyledContainer>
      <Checkbox checked={currentRowSelected} onChange={handleContainerClick} />
    </StyledContainer>
  );
}
