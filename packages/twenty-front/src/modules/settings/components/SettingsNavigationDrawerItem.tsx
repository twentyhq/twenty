import { useMatch, useResolvedPath } from 'react-router-dom';

import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { type SettingsNavigationItem } from '@/settings/hooks/useSettingsNavigationItems';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { type NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

type SettingsNavigationDrawerItemProps = {
  item: SettingsNavigationItem;
  subItemState?: NavigationDrawerSubItemState;
  hasActiveSubItem?: boolean;
};

// All settings nav items render their icon inside a uniform grey tile via
// TintedIconTile. Per-section colored tiles (Profile=blue, Accounts=orange,
// etc.) are deliberately out of scope here and live on a separate branch.
const SETTINGS_NAV_ICON_TILE_COLOR = 'gray';

export const SettingsNavigationDrawerItem = ({
  item,
  subItemState,
  hasActiveSubItem = false,
}: SettingsNavigationDrawerItemProps) => {
  const href = item.path ? getSettingsPath(item.path) : '';
  const pathName = useResolvedPath(href).pathname;
  const matchResult = useMatch({
    path: pathName,
    end: item.matchSubPages === false,
  });

  const isActive = !!item.path && !!matchResult && !hasActiveSubItem;

  if (isDefined(item.isHidden) && item.isHidden) {
    return null;
  }

  if (isDefined(item.isAdvanced) && item.isAdvanced) {
    return (
      <AdvancedSettingsWrapper>
        <NavigationDrawerItem
          indentationLevel={item.indentationLevel}
          subItemState={subItemState}
          label={item.label}
          to={href}
          Icon={item.Icon}
          iconColor={SETTINGS_NAV_ICON_TILE_COLOR}
          active={isActive}
          modifier={item.modifier}
          onClick={item.onClick}
        />
      </AdvancedSettingsWrapper>
    );
  }

  return (
    <NavigationDrawerItem
      indentationLevel={item.indentationLevel}
      subItemState={subItemState}
      label={item.label}
      to={href || undefined}
      Icon={item.Icon}
      iconColor={SETTINGS_NAV_ICON_TILE_COLOR}
      active={isActive}
      modifier={item.modifier}
      onClick={item.onClick}
    />
  );
};
