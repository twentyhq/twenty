import React, { useEffect } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCheck } from '@/ui/icon/index';
import { hoverBackground } from '@/ui/theme/constants/effects';

import { DropdownMenuItem } from './DropdownMenuItem';

type Props = React.ComponentProps<'li'> & {
  selected?: boolean;
  hovered?: boolean;
  disabled?: boolean;
};

const DropdownMenuSelectableItemContainer = styled(DropdownMenuItem)<
  Pick<Props, 'hovered'>
>`
  ${hoverBackground};

  align-items: center;

  background: ${(props) =>
    props.hovered ? props.theme.background.transparent.light : 'transparent'};

  display: flex;
  justify-content: space-between;

  width: calc(100% - ${({ theme }) => theme.spacing(2)});
`;

const StyledLeftContainer = styled.div<Pick<Props, 'disabled'>>`
  align-items: center;

  display: flex;

  gap: ${({ theme }) => theme.spacing(2)};

  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

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
  disabled,
  ...restProps
}: React.PropsWithChildren<Props>) {
  const theme = useTheme();

  function handleClick(event: React.MouseEvent<HTMLLIElement>) {
    if (disabled) {
      return;
    }

    onClick?.(event);
  }

  useEffect(() => {
    if (hovered) {
      window.scrollTo({
        behavior: 'smooth',
      });
    }
  }, [hovered]);

  return (
    <DropdownMenuSelectableItemContainer
      {...restProps}
      onClick={handleClick}
      hovered={hovered}
      data-testid="dropdown-menu-item"
    >
      <StyledLeftContainer disabled={disabled}>{children}</StyledLeftContainer>
      <StyledRightIcon>
        {selected && <IconCheck size={theme.icon.size.md} />}
      </StyledRightIcon>
    </DropdownMenuSelectableItemContainer>
  );
}
