import React from 'react';
import styled from '@emotion/styled';

import { IconCheck } from '@/ui/icons/index';
import { hoverBackground } from '@/ui/layout/styles/themes';

import { DropdownMenuButton } from './DropdownMenuButton';

type Props = {
  selected: boolean;
  onClick: () => void;
};

const DropdownMenuSelectableItemContainer = styled(DropdownMenuButton)<Props>`
  ${hoverBackground};

  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;

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
