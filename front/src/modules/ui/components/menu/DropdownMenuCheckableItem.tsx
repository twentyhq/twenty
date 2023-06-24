import React from 'react';
import styled from '@emotion/styled';

import { Checkbox } from '../form/Checkbox';

import { DropdownMenuButton } from './DropdownMenuButton';

type Props = {
  checked: boolean;
  onChange?: (newCheckedValue: boolean) => void;
  id?: string;
};

const DropdownMenuCheckableItemContainer = styled(DropdownMenuButton)`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;

  gap: ${(props) => props.theme.spacing(2)};
`;

const StyledChildrenContainer = styled.div`
  align-items: center;

  display: flex;
  font-size: ${(props) => props.theme.fontSizeSmall};
  gap: ${(props) => props.theme.spacing(2)};
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
        <Checkbox id={id} name={id} checked={checked} />
        <StyledChildrenContainer>{children}</StyledChildrenContainer>
      </StyledLeftContainer>
    </DropdownMenuCheckableItemContainer>
  );
}
