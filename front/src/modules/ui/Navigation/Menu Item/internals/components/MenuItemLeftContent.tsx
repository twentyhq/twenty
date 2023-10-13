import { useTheme } from '@emotion/react';

import { IconGripVertical } from '@/ui/Display/Icon';
import { IconComponent } from '@/ui/Display/Icon/types/IconComponent';
import { OverflowingTextWithTooltip } from '@/ui/Display/Tooltip/OverflowingTextWithTooltip';

import {
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from './StyledMenuItemBase';

type MenuItemLeftContentProps = {
  LeftIcon: IconComponent | null | undefined;
  showGrip?: boolean;
  text: string;
};

export const MenuItemLeftContent = ({
  LeftIcon,
  text,
  showGrip = false,
}: MenuItemLeftContentProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemLeftContent>
      {showGrip && (
        <IconGripVertical
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.extraLight}
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
