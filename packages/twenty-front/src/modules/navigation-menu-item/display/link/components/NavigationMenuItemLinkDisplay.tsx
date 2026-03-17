import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/common/states/isNavigationMenuInEditModeState';
import { getLinkNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/link/utils/getLinkNavigationMenuItemComputedLink';
import { getLinkNavigationMenuItemLabel } from '@/navigation-menu-item/display/link/utils/getLinkNavigationMenuItemLabel';
import type { WorkspaceSectionItemContentProps } from '@/navigation-menu-item/display/sections/types/WorkspaceSectionItemContentProps';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { IconArrowUpRight } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type NavigationMenuItemLinkDisplayProps = WorkspaceSectionItemContentProps;

export const NavigationMenuItemLinkDisplay = ({
  item,
  editModeProps,
  isDragging,
}: NavigationMenuItemLinkDisplayProps) => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );

  const label = getLinkNavigationMenuItemLabel(item);
  const computedLink = getLinkNavigationMenuItemComputedLink(item);

  return (
    <NavigationDrawerItem
      label={label}
      to={isNavigationMenuInEditMode || isDragging ? undefined : computedLink}
      onClick={
        isNavigationMenuInEditMode ? editModeProps.onEditModeClick : undefined
      }
      Icon={() => <NavigationMenuItemIcon navigationMenuItem={item} />}
      active={false}
      isSelectedInEditMode={editModeProps.isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent="CLICK"
      rightOptions={
        !isNavigationMenuInEditMode && (
          <IconArrowUpRight
            size={themeCssVariables.icon.size.sm}
            stroke={themeCssVariables.icon.stroke.md}
            color={themeCssVariables.font.color.light}
          />
        )
      }
    />
  );
};
