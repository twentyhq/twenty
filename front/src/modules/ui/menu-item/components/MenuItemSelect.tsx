import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCheck } from '@/ui/icon';
import { IconComponent } from '@/ui/icon/types/IconComponent';

import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '../internals/components/StyledMenuItemBase';

export const StyledMenuItemSelect = styled(StyledMenuItemBase)<{
  selected: boolean;
  disabled?: boolean;
}>`
  ${({ theme, selected, disabled }) => {
    if (selected) {
      return css`
        background: ${theme.background.transparent.light};
        &:hover {
          background: ${theme.background.transparent.medium};
        }
      `;
    } else if (disabled) {
      return css`
        background: ${theme.background.transparent.primary};
        &:hover {
          background: ${theme.background.transparent.primary};
        }

        color: ${theme.font.color.tertiary};
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
};

export function MenuItemSelect({
  LeftIcon,
  text,
  selected,
  className,
  onClick,
  disabled,
}: OwnProps) {
  const theme = useTheme();

  return (
    <StyledMenuItemSelect
      onClick={onClick}
      className={className}
      selected={selected}
      disabled={disabled ?? false}
    >
      <MenuItemLeftContent LeftIcon={LeftIcon} text={text} />
      {selected && <IconCheck size={theme.icon.size.sm} />}
    </StyledMenuItemSelect>
  );
}
