import { ReactNode } from 'react';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCheck } from '@/ui/icon';
import { OverflowingTextWithTooltip } from '@/ui/tooltip/OverflowingTextWithTooltip';

import {
  StyledMenuItemBase,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

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
  avatar: ReactNode;
  selected: boolean;
  text: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function MenuItemSelectAvatar({
  avatar,
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
    >
      <StyledMenuItemLeftContent>
        {avatar}
        <StyledMenuItemLabel hasLeftIcon={!!avatar}>
          <OverflowingTextWithTooltip text={text} />
        </StyledMenuItemLabel>
      </StyledMenuItemLeftContent>
      {selected && <IconCheck size={theme.icon.size.sm} />}
    </StyledMenuItemSelect>
  );
}
