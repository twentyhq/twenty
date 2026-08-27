import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { getNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemColor';
import { getPageLayoutNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/page-layout/utils/getPageLayoutNavigationMenuItemComputedLink';
import { getCoreNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/core/utils/getCoreNavigationMenuItemComputedLink';
import { NavigationMenuItemType } from 'twenty-shared/types';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemPageLayoutDisplayProps =
  NavigationMenuItemSectionContentProps;

export const NavigationMenuItemPageLayoutDisplay = ({
  item,
  editModeProps,
  isDragging,
  rightOptions,
}: NavigationMenuItemPageLayoutDisplayProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const { getIcon } = useIcons();
  const { t } = useLingui();
  const location = useLocation();

  const isCoreItem = item.type === NavigationMenuItemType.CORE;

  const label = item.name ?? '';
  const computedLink = isCoreItem
    ? getCoreNavigationMenuItemComputedLink(item)
    : getPageLayoutNavigationMenuItemComputedLink(item);
  const pageLayoutColor = getNavigationMenuItemColor(item);

  const Icon = isDefined(item.icon) ? getIcon(item.icon) : undefined;
  const isActive = computedLink !== '' && location.pathname === computedLink;

  return (
    <NavigationDrawerItem
      label={label}
      secondaryLabel={isCoreItem ? t`System` : undefined}
      to={
        isLayoutCustomizationModeEnabled || isDragging
          ? undefined
          : computedLink
      }
      onClick={
        isLayoutCustomizationModeEnabled
          ? editModeProps?.onEditModeClick
          : undefined
      }
      Icon={Icon}
      iconColor={pageLayoutColor}
      active={isActive}
      isSelectedInEditMode={editModeProps?.isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent="CLICK"
      rightOptions={rightOptions}
    />
  );
};
