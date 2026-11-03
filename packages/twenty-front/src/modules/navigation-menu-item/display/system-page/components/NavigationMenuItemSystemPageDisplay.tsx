import { useLingui } from '@lingui/react/macro';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { lastClickedNavigationMenuItemIdState } from '@/navigation-menu-item/common/states/lastClickedNavigationMenuItemIdState';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { useIdentifyActiveNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useIdentifyActiveNavigationMenuItems';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';
import { getSystemPageNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/system-page/utils/getSystemPageNavigationMenuItemComputedLink';
import { getSystemPageNavigationMenuItemLabel } from '@/navigation-menu-item/display/system-page/utils/getSystemPageNavigationMenuItemLabel';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

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
  const setLastClickedNavigationMenuItemId = useSetAtomState(
    lastClickedNavigationMenuItemIdState,
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
          : () => setLastClickedNavigationMenuItemId(item.id)
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
