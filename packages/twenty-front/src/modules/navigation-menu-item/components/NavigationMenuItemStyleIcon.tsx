import type { IconComponent } from 'twenty-ui/display';
import { ICON_SIZES, ICON_STROKES } from 'twenty-ui/theme-constants';

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
  const style = getNavigationMenuItemIconStyleFromColor(color);
  return (
    <StyledNavigationMenuItemIconContainer
      $backgroundColor={style.backgroundColor}
      $borderColor={style.borderColor}
    >
      <Icon
        size={ICON_SIZES.md}
        stroke={ICON_STROKES.md}
        color={style.iconColor}
      />
    </StyledNavigationMenuItemIconContainer>
  );
};
