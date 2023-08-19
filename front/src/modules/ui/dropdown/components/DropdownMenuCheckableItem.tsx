import React from 'react';
import styled from '@emotion/styled';

import { Checkbox } from '@/ui/input/checkbox/components/Checkbox';

import { DropdownMenuItem } from './DropdownMenuItem';

type Props = {
  checked: boolean;
  onChange?: (newCheckedValue: boolean) => void;
  id?: string;
};

const StyledDropdownMenuCheckableItemContainer = styled(DropdownMenuItem)`
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
    <StyledDropdownMenuCheckableItemContainer onClick={handleClick}>
      <StyledLeftContainer>
        <Checkbox checked={checked} />
        <StyledChildrenContainer>{children}</StyledChildrenContainer>
      </StyledLeftContainer>
    </StyledDropdownMenuCheckableItemContainer>
  );
}
