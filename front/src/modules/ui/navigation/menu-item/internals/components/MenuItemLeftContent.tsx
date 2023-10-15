import { useTheme } from '@emotion/react';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { OverflowingTextWithTooltip } from '@/ui/display/tooltip/OverflowingTextWithTooltip';
import { IconGripVertical } from '@/ui/input/constants/icons';
import { ThemeColor } from '@/ui/theme/constants/colors';

import {
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from './StyledMenuItemBase';

type MenuItemLeftContentProps = {
  LeftIcon: IconComponent | null | undefined;
  showGrip?: boolean;
  textColor?: ThemeColor;
  text: string;
};

export const MenuItemLeftContent = ({
  LeftIcon,
  text,
  textColor,
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
        <OverflowingTextWithTooltip textColor={textColor} text={text} />
      </StyledMenuItemLabel>
    </StyledMenuItemLeftContent>
  );
};
