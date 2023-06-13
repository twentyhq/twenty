import React from 'react';
import styled from '@emotion/styled';
import { IconCheck } from '@tabler/icons-react';

import { DropdownMenuItem } from './DropdownMenuItem';

type Props = {
  selected: boolean;
  onClick: () => void;
};

const DropdownMenuSelectableItemContainer = styled(DropdownMenuItem)<Props>`
  transition: background 0.1s ease;

  background: ${(props) => (props.selected ? 'rgba(0, 0, 0, 0.04);' : 'none;')};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledLeftContainer = styled.div`
  display: flex;
  align-items: center;

  gap: 8px;
`;

const StyledRightIcon = styled.div`
  display: flex;
`;

export function DropdownMenuSelectableItem({
  selected,
  onClick,
  children,
}: React.PropsWithChildren<Props>) {
  return (
    <DropdownMenuSelectableItemContainer onClick={onClick} selected={selected}>
      <StyledLeftContainer>{children}</StyledLeftContainer>
      <StyledRightIcon>{selected && <IconCheck size={16} />}</StyledRightIcon>
    </DropdownMenuSelectableItemContainer>
  );
}
