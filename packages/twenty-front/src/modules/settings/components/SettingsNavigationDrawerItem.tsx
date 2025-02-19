import { useMatch, useResolvedPath } from 'react-router-dom';

import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsNavigationItem } from '@/settings/hooks/useSettingsNavigationItems';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { isDefined } from 'twenty-shared';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type SettingsNavigationDrawerItemProps = {
  item: SettingsNavigationItem;
  subItemState?: NavigationDrawerSubItemState;
};

export const SettingsNavigationDrawerItem = ({
  item,
  subItemState,
}: SettingsNavigationDrawerItemProps) => {
  const href = getSettingsPath(item.path);
  const pathName = useResolvedPath(href).pathname;
  const isActive = !!useMatch({
    path: pathName,
    end: !item.matchSubPages,
  });

  if (isDefined(item.isHidden) && item.isHidden) {
    return null;
  }

  if (isDefined(item.isAdvanced) && item.isAdvanced) {
    return (
      <AdvancedSettingsWrapper navigationDrawerItem>
        <NavigationDrawerItem
          indentationLevel={item.indentationLevel}
          subItemState={subItemState}
          label={item.label}
          to={href}
          Icon={item.Icon}
          active={isActive}
          soon={item.soon}
        />
      </AdvancedSettingsWrapper>
    );
  }

  return (
    <NavigationDrawerItem
      indentationLevel={item.indentationLevel}
      subItemState={subItemState}
      label={item.label}
      to={href}
      Icon={item.Icon}
      active={isActive}
      soon={item.soon}
    />
  );
};
