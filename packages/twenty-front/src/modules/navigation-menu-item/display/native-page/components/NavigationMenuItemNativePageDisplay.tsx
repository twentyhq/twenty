import { isDefined } from 'twenty-shared/utils';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { useIdentifyActiveNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useIdentifyActiveNavigationMenuItems';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';
import { getNativePageNavigationMenuItemConfig } from '@/navigation-menu-item/display/native-page/utils/getNativePageNavigationMenuItemConfig';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { NavigationMenuTabFirstItemOpenEffect } from '@/navigation-menu-item/display/effect-components/NavigationMenuTabFirstItemOpenEffect';

type NavigationMenuItemNativePageDisplayProps = Pick<
  NavigationMenuItemSectionContentProps,
  'item' | 'editModeProps' | 'isDragging' | 'rightOptions'
>;

export const NavigationMenuItemNativePageDisplay = ({
  item,
  editModeProps,
  isDragging,
  rightOptions,
}: NavigationMenuItemNativePageDisplayProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const { activeNavigationMenuItemIds } =
    useIdentifyActiveNavigationMenuItems();

  const nativePagePath = getNativePageNavigationMenuItemConfig(item)?.path;

  return (
    <>
      {isDefined(nativePagePath) && (
        <NavigationMenuTabFirstItemOpenEffect to={nativePagePath} />
      )}
      <NavigationDrawerItem
        label={getNavigationMenuItemLabel(item, [], [])}
        to={
          isLayoutCustomizationModeEnabled || isDragging
            ? undefined
            : nativePagePath
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
    </>
  );
};
