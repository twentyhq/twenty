import { useTheme } from '@emotion/react';

import { IconGripVertical } from '@/ui/icon';
import { IconComponent } from '@/ui/icon/types/IconComponent';
import { ThemeColor } from '@/ui/theme/constants/colors';
import { OverflowingTextWithTooltip } from '@/ui/tooltip/OverflowingTextWithTooltip';

import {
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from './StyledMenuItemBase';

type OwnProps = {
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
}: OwnProps) => {
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
