import React from 'react';
import styled from '@emotion/styled';

import { Checkbox } from '../form/Checkbox';

import { DropdownMenuItem } from './DropdownMenuItem';

type Props = {
  checked: boolean;
  onChange?: (newCheckedValue: boolean) => void;
  id: string;
};

const DropdownMenuCheckableItemContainer = styled(DropdownMenuItem)`
  transition: background 0.1s ease;

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledLeftContainer = styled.div`
  display: flex;
  align-items: center;

  gap: 8px;
`;

const StyledChildrenContainer = styled.div`
  font-size: ${(props) => props.theme.fontSizeSmall};

  display: flex;
  align-items: center;
  gap: 8px;
`;

export function DropdownMenuCheckableItem({
  checked,
  onChange,
  id,
  children,
}: React.PropsWithChildren<Props>) {
  function handleClick() {
    onChange?.(!checked);
  }

  return (
    <DropdownMenuCheckableItemContainer onClick={handleClick}>
      <StyledLeftContainer>
        <Checkbox onChange={onChange} id={id} name={id} checked={checked} />
        <StyledChildrenContainer>{children}</StyledChildrenContainer>
      </StyledLeftContainer>
    </DropdownMenuCheckableItemContainer>
  );
}
