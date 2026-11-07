import { isValidElement } from 'react';
import { useTheme } from 'twenty-ui/theme';

import { type NavigationDrawerItemProps } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerItemProps';

type NavigationDrawerItemIconProps = {
  Icon: NonNullable<NavigationDrawerItemProps['Icon']>;
  color: string;
};

export const NavigationDrawerItemIcon = ({
  Icon,
  color,
}: NavigationDrawerItemIconProps) => {
  const theme = useTheme();

  if (isValidElement(Icon)) {
    return Icon;
  }

  return (
    <Icon
      size={theme.icon.size.md}
      stroke={theme.icon.stroke.md}
      color={color}
    />
  );
};
