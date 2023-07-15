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

  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledChildrenContainer = styled.div`
  align-items: center;

  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
`;

export function DropdownMenuCheckableItem({
  checked,
  onChange,
  children,
}: React.PropsWithChildren<Props>) {
  function handleClick() {
    onChange?.(!checked);
  }

  return (
    <DropdownMenuCheckableItemContainer>
      <StyledLeftContainer>
        <Checkbox checked={checked} onChange={handleClick} />
        <StyledChildrenContainer>{children}</StyledChildrenContainer>
      </StyledLeftContainer>
    </DropdownMenuCheckableItemContainer>
  );
}
