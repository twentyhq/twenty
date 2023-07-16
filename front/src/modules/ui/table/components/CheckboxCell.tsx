import * as React from 'react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';

import { Checkbox } from '@/ui/input/components/Checkbox';

import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';
import { contextMenuPositionState } from '../states/contextMenuPositionState';

const StyledContainer = styled.div`
  align-items: center;

  display: flex;
  height: 32px;

  justify-content: center;
`;

export function CheckboxCell() {
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);

  const { currentRowSelected, setCurrentRowSelected } = useCurrentRowSelected();

  function onChange(checked: boolean) {
    handleCheckboxChange(checked);
  }

  function handleCheckboxChange(newCheckedValue: boolean) {
    setCurrentRowSelected(newCheckedValue);

    setContextMenuPosition({ x: null, y: null });
  }

  return (
    <StyledContainer>
      <Checkbox checked={currentRowSelected} onChange={onChange} />
    </StyledContainer>
  );
}
