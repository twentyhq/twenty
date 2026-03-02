import { useContext } from 'react';
import type { IconComponent } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme';

import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';
import { getNavigationMenuItemIconStyleFromColor } from '@/navigation-menu-item/utils/get-navigation-menu-item-icon-style-from-color';

export type NavigationMenuItemStyleIconProps = {
  Icon: IconComponent;
  color?: string | null;
};

export const NavigationMenuItemStyleIcon = ({
  Icon,
  color,
}: NavigationMenuItemStyleIconProps) => {
  const { theme } = useContext(ThemeContext);
  const style = getNavigationMenuItemIconStyleFromColor(theme, color);
  return (
    <StyledNavigationMenuItemIconContainer
      $backgroundColor={style.backgroundColor}
      $borderColor={style.borderColor}
    >
      <Icon
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.md}
        color={style.iconColor}
      />
    </StyledNavigationMenuItemIconContainer>
  );
};
