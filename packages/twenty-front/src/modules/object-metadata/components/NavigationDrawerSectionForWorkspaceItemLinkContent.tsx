import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
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
  const isLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );
  const linkItem = item as ProcessedNavigationMenuItem;
  return (
    <NavigationDrawerItem
      label={linkItem.labelIdentifier}
      to={isLayoutCustomizationActive || isDragging ? undefined : linkItem.link}
      onClick={
        isLayoutCustomizationActive ? editModeProps.onEditModeClick : undefined
      }
      Icon={() => <NavigationMenuItemIcon navigationMenuItem={linkItem} />}
      active={false}
      isSelectedInEditMode={editModeProps.isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent="CLICK"
      rightOptions={
        !isLayoutCustomizationActive && (
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
