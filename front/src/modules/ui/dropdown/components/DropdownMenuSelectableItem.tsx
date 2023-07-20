import React, { useEffect } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCheck } from '@/ui/icon/index';
import { hoverBackground } from '@/ui/themes/effects';

import { DropdownMenuItem } from './DropdownMenuItem';

type Props = {
  selected?: boolean;
  onClick: () => void;
  hovered?: boolean;
};

const DropdownMenuSelectableItemContainer = styled(DropdownMenuItem)<Props>`
  ${hoverBackground};

  align-items: center;

  background: ${(props) =>
    props.hovered ? props.theme.background.transparent.light : 'transparent'};

  display: flex;
  justify-content: space-between;

  max-width: 150px;
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;

  gap: ${({ theme }) => theme.spacing(2)};

  overflow: hidden;
`;

const StyledRightIcon = styled.div`
  display: flex;
`;

export function DropdownMenuSelectableItem({
  selected,
  onClick,
  children,
  hovered,
}: React.PropsWithChildren<Props>) {
  const theme = useTheme();

  useEffect(() => {
    if (hovered) {
      window.scrollTo({
        behavior: 'smooth',
      });
    }
  }, [hovered]);

  return (
    <DropdownMenuSelectableItemContainer
      onClick={onClick}
      selected={selected}
      hovered={hovered}
      data-testid="dropdown-menu-item"
    >
      <StyledLeftContainer>{children}</StyledLeftContainer>
      <StyledRightIcon>
        {selected && <IconCheck size={theme.icon.size.md} />}
      </StyledRightIcon>
    </DropdownMenuSelectableItemContainer>
  );
}
