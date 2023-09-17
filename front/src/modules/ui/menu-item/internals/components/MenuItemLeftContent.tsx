import { useTheme } from '@emotion/react';

import { IconGripVertical } from '@/ui/icon';
import { IconComponent } from '@/ui/icon/types/IconComponent';
import { OverflowingTextWithTooltip } from '@/ui/tooltip/OverflowingTextWithTooltip';

import {
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from './StyledMenuItemBase';

type OwnProps = {
  isDraggable?: boolean;
  LeftIcon: IconComponent | null | undefined;
  text: string;
};

export const MenuItemLeftContent = ({
  isDraggable,
  LeftIcon,
  text,
}: OwnProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemLeftContent>
      {isDraggable && (
        <IconGripVertical
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      )}
      {LeftIcon && (
        <LeftIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      )}
      <StyledMenuItemLabel hasLeftIcon={!!LeftIcon}>
        <OverflowingTextWithTooltip text={text} />
      </StyledMenuItemLabel>
    </StyledMenuItemLeftContent>
  );
};
