import React from 'react';
import styled from '@emotion/styled';
import { IconCheck } from '@tabler/icons-react';

import { hoverBackground } from '@/ui/layout/styles/themes';

import { DropdownMenuButton } from './DropdownMenuButton';

type Props = {
  selected: boolean;
  onClick: () => void;
};

const DropdownMenuSelectableItemContainer = styled(DropdownMenuButton)<Props>`
  ${hoverBackground};

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledLeftContainer = styled.div`
  display: flex;
  align-items: center;

  gap: ${(props) => props.theme.spacing(2)};
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
