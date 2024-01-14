import { useTheme } from '@emotion/react';

import { IconGripVertical } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { OverflowingTextWithTooltip } from '@/ui/display/tooltip/OverflowingTextWithTooltip';

import {
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from './StyledMenuItemBase';

type MenuItemLeftContentProps = {
  LeftIcon: IconComponent | null | undefined;
  showGrip?: boolean;
  text: string;
  isCentered?: boolean;
};

export const MenuItemLeftContent = ({
  LeftIcon,
  text,
  showGrip = false,
  isCentered = false,
}: MenuItemLeftContentProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemLeftContent isCentered={isCentered}>
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
