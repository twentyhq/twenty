import { useMatch, useResolvedPath } from 'react-router-dom';
import { NavigationDrawerItem, NavigationDrawerItemProps } from 'twenty-ui';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';

type SettingsNavigationDrawerItemProps = Pick<
  NavigationDrawerItemProps,
  'Icon' | 'label' | 'level' | 'soon'
> & {
  matchSubPages?: boolean;
  path: SettingsPath;
};

export const SettingsNavigationDrawerItem = ({
  Icon,
  label,
  level,
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
      level={level}
      label={label}
      to={href}
      Icon={Icon}
      active={isActive}
      soon={soon}
    />
  );
};
