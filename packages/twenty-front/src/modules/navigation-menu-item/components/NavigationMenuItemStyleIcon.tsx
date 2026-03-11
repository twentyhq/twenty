import type { IconComponent } from 'twenty-ui/display';
import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';
import { getNavigationMenuItemIconStyleFromColor } from '@/navigation-menu-item/utils/getNavigationMenuItemIconStyleFromColor';
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
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.md}
        color={style.iconColor}
      />
    </StyledNavigationMenuItemIconContainer>
  );
};
