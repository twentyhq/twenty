import { useTheme } from '@emotion/react';
import type { IconComponent } from 'twenty-ui/display';

import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';

type IconWithBackgroundProps = {
  Icon: IconComponent;
  backgroundColor: string;
  size?: number | string;
  stroke?: number | string;
};

export const IconWithBackground = ({
  Icon,
  backgroundColor,
  size,
  stroke,
}: IconWithBackgroundProps) => {
  const theme = useTheme();
  return (
    <StyledNavigationMenuItemIconContainer $backgroundColor={backgroundColor}>
      <Icon
        size={size ?? theme.icon.size.md}
        stroke={stroke ?? theme.icon.stroke.md}
        color={theme.grayScale.gray1}
      />
    </StyledNavigationMenuItemIconContainer>
  );
};
