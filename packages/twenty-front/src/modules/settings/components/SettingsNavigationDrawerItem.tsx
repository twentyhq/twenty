import { useMatch, useResolvedPath } from 'react-router-dom';

import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsPath } from '@/types/SettingsPath';
import {
  NavigationDrawerItem,
  NavigationDrawerItemProps,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type SettingsNavigationDrawerItemProps = Pick<
  NavigationDrawerItemProps,
  'Icon' | 'label' | 'indentationLevel' | 'soon'
> & {
  matchSubPages?: boolean;
  path: SettingsPath;
  subItemState?: NavigationDrawerSubItemState;
  isAdvanced?: boolean;
  isHidden?: boolean;
};

export const SettingsNavigationDrawerItem = ({
  Icon,
  label,
  indentationLevel,
  matchSubPages = true,
  path,
  soon,
  subItemState,
  isAdvanced = false,
  isHidden = false,
}: SettingsNavigationDrawerItemProps) => {
  const href = getSettingsPath(path);
  const pathName = useResolvedPath(href).pathname;
  const isActive = !!useMatch({
    path: pathName,
    end: !matchSubPages,
  });

  if (isHidden) {
    return null;
  }

  const navigationItem = (
    <NavigationDrawerItem
      indentationLevel={indentationLevel}
      subItemState={subItemState}
      label={label}
      to={href}
      Icon={Icon}
      active={isActive}
      soon={soon}
    />
  );

  if (isAdvanced) {
    return (
      <AdvancedSettingsWrapper navigationDrawerItem>
        {navigationItem}
      </AdvancedSettingsWrapper>
    );
  }

  return navigationItem;
};
