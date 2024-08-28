import { useMatch, useResolvedPath } from 'react-router-dom';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import {
  NavigationDrawerItem,
  NavigationDrawerItemProps,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

type SettingsNavigationDrawerItemProps = Pick<
  NavigationDrawerItemProps,
  'Icon' | 'label' | 'indentationLevel' | 'soon'
> & {
  matchSubPages?: boolean;
  path: SettingsPath;
};

export const SettingsNavigationDrawerItem = ({
  Icon,
  label,
  indentationLevel,
  matchSubPages = false,
  path,
  soon,
}: SettingsNavigationDrawerItemProps) => {
  const href = getSettingsPagePath(path);
  const isActive = !!useMatch({
    path: useResolvedPath(href).pathname,
    end: !matchSubPages,
  });

  return (
    <NavigationDrawerItem
      indentationLevel={indentationLevel}
      label={label}
      to={href}
      Icon={Icon}
      active={isActive}
      soon={soon}
    />
  );
};
