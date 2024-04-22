import { useTheme } from '@emotion/react';
import {
  IconComponent,
  IconGripVertical,
  OverflowingTextWithTooltip,
} from 'twenty-ui';

import {
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from './StyledMenuItemBase';

type MenuItemLeftContentProps = {
  className?: string;
  LeftIcon: IconComponent | null | undefined;
  showGrip?: boolean;
  text: string;
};

export const MenuItemLeftContent = ({
  className,
  LeftIcon,
  text,
  showGrip = false,
}: MenuItemLeftContentProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemLeftContent className={className}>
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
