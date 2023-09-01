import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCheck } from '@/ui/icon';
import { IconComponent } from '@/ui/icon/types/IconComponent';

import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '../internals/components/StyledMenuItemBase';

const StyledMenuItemSelect = styled(StyledMenuItemBase)<{ selected: boolean }>`
  ${({ theme, selected }) => {
    if (selected) {
      return css`
        background: ${theme.background.transparent.light};
        &:hover {
          background: ${theme.background.transparent.medium};
        }
      `;
    }
  }}
`;

type OwnProps = {
  LeftIcon?: IconComponent;
  selected: boolean;
  text: string;
  className: string;
  onClick?: () => void;
};

export function MenuItemSelect({
  LeftIcon,
  text,
  selected,
  className,
  onClick,
}: OwnProps) {
  const theme = useTheme();

  return (
    <StyledMenuItemSelect
      onClick={onClick}
      className={className}
      selected={selected}
    >
      <MenuItemLeftContent LeftIcon={LeftIcon} text={text} />
      {selected && <IconCheck size={theme.icon.size.sm} />}
    </StyledMenuItemSelect>
  );
}
