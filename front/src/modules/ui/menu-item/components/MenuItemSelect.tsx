import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCheck } from '@/ui/icon';
import { IconComponent } from '@/ui/icon/types/IconComponent';

import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '../internals/components/StyledMenuItemBase';

export const StyledMenuItemSelect = styled(StyledMenuItemBase)<{
  selected: boolean;
  disabled?: boolean;
  hovered?: boolean;
}>`
  ${({ theme, selected, disabled, hovered }) => {
    if (selected) {
      return css`
        background: ${theme.background.transparent.light};
        &:hover {
          background: ${theme.background.transparent.medium};
        }
      `;
    } else if (disabled) {
      return css`
        background: inherit;
        &:hover {
          background: inherit;
        }

        color: ${theme.font.color.tertiary};

        cursor: default;
      `;
    } else if (hovered) {
      return css`
        background: ${theme.background.transparent.light};
      `;
    }
  }}
`;

type OwnProps = {
  LeftIcon?: IconComponent | null | undefined;
  selected: boolean;
  text: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  hovered?: boolean;
};

export function MenuItemSelect({
  LeftIcon,
  text,
  selected,
  className,
  onClick,
  disabled,
  hovered,
}: OwnProps) {
  const theme = useTheme();

  return (
    <StyledMenuItemSelect
      onClick={onClick}
      className={className}
      selected={selected}
      disabled={disabled}
      hovered={hovered}
    >
      <MenuItemLeftContent LeftIcon={LeftIcon} text={text} />
      {selected && <IconCheck size={theme.icon.size.sm} />}
    </StyledMenuItemSelect>
  );
}
