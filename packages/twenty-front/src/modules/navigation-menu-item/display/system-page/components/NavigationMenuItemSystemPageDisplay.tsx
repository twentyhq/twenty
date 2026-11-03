import { useLingui } from '@lingui/react/macro';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { useIdentifyActiveNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useIdentifyActiveNavigationMenuItems';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';
import { getSystemPageNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/system-page/utils/getSystemPageNavigationMenuItemComputedLink';
import { getSystemPageNavigationMenuItemLabel } from '@/navigation-menu-item/display/system-page/utils/getSystemPageNavigationMenuItemLabel';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemSystemPageDisplayProps =
  NavigationMenuItemSectionContentProps;

export const NavigationMenuItemSystemPageDisplay = ({
  item,
  editModeProps,
  isDragging,
  rightOptions,
}: NavigationMenuItemSystemPageDisplayProps) => {
  const { t } = useLingui();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const { activeNavigationMenuItemIds } =
    useIdentifyActiveNavigationMenuItems();

  return (
    <NavigationDrawerItem
      label={getSystemPageNavigationMenuItemLabel(item)}
      secondaryLabel={t`System`}
      to={
        isLayoutCustomizationModeEnabled || isDragging
          ? undefined
          : getSystemPageNavigationMenuItemComputedLink(item)
      }
      onClick={
        isLayoutCustomizationModeEnabled
          ? editModeProps?.onEditModeClick
          : undefined
      }
      Icon={() => <NavigationMenuItemIcon navigationMenuItem={item} />}
      active={activeNavigationMenuItemIds.includes(item.id)}
      isSelectedInEditMode={editModeProps?.isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent="CLICK"
      rightOptions={rightOptions}
    />
  );
};
