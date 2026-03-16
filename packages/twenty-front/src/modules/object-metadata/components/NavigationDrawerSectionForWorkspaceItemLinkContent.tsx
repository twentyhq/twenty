import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { isLayoutCustomizationModeEnabledState } from '@/app/states/isLayoutCustomizationModeEnabledState';
import type { ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import type { WorkspaceSectionItemContentProps } from '@/object-metadata/components/WorkspaceSectionItemContentProps';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { IconArrowUpRight } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type NavigationDrawerSectionForWorkspaceItemLinkContentProps =
  WorkspaceSectionItemContentProps;

export const NavigationDrawerSectionForWorkspaceItemLinkContent = ({
  item,
  editModeProps,
  isDragging,
}: NavigationDrawerSectionForWorkspaceItemLinkContentProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const linkItem = item as ProcessedNavigationMenuItem;
  return (
    <NavigationDrawerItem
      label={linkItem.labelIdentifier}
      to={
        isLayoutCustomizationModeEnabled || isDragging
          ? undefined
          : linkItem.link
      }
      onClick={
        isLayoutCustomizationModeEnabled
          ? editModeProps.onEditModeClick
          : undefined
      }
      Icon={() => <NavigationMenuItemIcon navigationMenuItem={linkItem} />}
      active={false}
      isSelectedInEditMode={editModeProps.isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent="CLICK"
      rightOptions={
        !isLayoutCustomizationModeEnabled && (
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
