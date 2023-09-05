import { ReactNode } from 'react';
import { useTheme } from '@emotion/react';

import { IconCheck } from '@/ui/icon';
import { OverflowingTextWithTooltip } from '@/ui/tooltip/OverflowingTextWithTooltip';

import {
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

import { StyledMenuItemSelect } from './MenuItemSelect';

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
      disabled={disabled}
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
