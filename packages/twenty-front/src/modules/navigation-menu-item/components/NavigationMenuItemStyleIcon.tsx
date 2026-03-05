import type { IconComponent } from 'twenty-ui/display';
import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';
import { getNavigationMenuItemIconStyleFromColor } from '@/navigation-menu-item/utils/get-navigation-menu-item-icon-style-from-color';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

export type NavigationMenuItemStyleIconProps = {
  Icon: IconComponent;
  color?: string | null;
};

export const NavigationMenuItemStyleIcon = ({
  Icon,
  color,
}: NavigationMenuItemStyleIconProps) => {
  const { theme } = useContext(ThemeContext);
  const style = getNavigationMenuItemIconStyleFromColor(color);
  return (
    <StyledNavigationMenuItemIconContainer
      $backgroundColor={style.backgroundColor}
      $borderColor={style.borderColor}
    >
      <Icon
        size={parseFloat(theme.icon.size.md)}
        stroke={parseFloat(theme.icon.stroke.md)}
        color={style.iconColor}
      />
    </StyledNavigationMenuItemIconContainer>
  );
};
