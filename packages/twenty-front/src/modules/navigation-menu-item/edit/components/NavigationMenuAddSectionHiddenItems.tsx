import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconLayoutList } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';

import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { getNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemColor';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useHiddenNavigationMenuItemsInTab } from '@/navigation-menu-item/edit/hooks/useHiddenNavigationMenuItemsInTab';
import { useRestoreHiddenNavigationMenuItem } from '@/navigation-menu-item/edit/hooks/useRestoreHiddenNavigationMenuItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuAddSectionHiddenItemsProps = {
  containerId: string | null;
  dropdownId: string;
};

export const NavigationMenuAddSectionHiddenItems = ({
  containerId,
  dropdownId,
}: NavigationMenuAddSectionHiddenItemsProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const hiddenNavigationMenuItems =
    useHiddenNavigationMenuItemsInTab(containerId);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { restoreHiddenNavigationMenuItem } =
    useRestoreHiddenNavigationMenuItem();
  const { closeDropdown } = useCloseDropdown();

  if (!isNonEmptyArray(hiddenNavigationMenuItems)) {
    return null;
  }

  const getStartIcon = (navigationMenuItem: NavigationMenuItem) => {
    switch (navigationMenuItem.type) {
      case NavigationMenuItemType.FOLDER:
        return (
          <ColoredIcon
            Icon={getIcon(navigationMenuItem.icon ?? FOLDER_ICON_DEFAULT)}
            color={getNavigationMenuItemColor(navigationMenuItem)}
          />
        );
      case NavigationMenuItemType.TAB:
        return (
          <ColoredIcon
            Icon={getIcon(
              navigationMenuItem.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT,
            )}
          />
        );
      case NavigationMenuItemType.SECTION:
        return (
          <ColoredIcon
            Icon={
              isDefined(navigationMenuItem.icon)
                ? getIcon(navigationMenuItem.icon)
                : IconLayoutList
            }
          />
        );
      default:
        return (
          <NavigationMenuItemIcon navigationMenuItem={navigationMenuItem} />
        );
    }
  };

  const getHiddenItemDisplay = (navigationMenuItem: NavigationMenuItem) => {
    const builtInSection = NAVIGATION_MENU_BUILT_IN_SECTIONS.find(
      ({ key }) => key === navigationMenuItem.builtInSectionKey,
    );

    if (isDefined(builtInSection)) {
      return {
        label: t(builtInSection.label),
        icon: (
          <ColoredIcon
            Icon={builtInSection.Icon}
            color={builtInSection.color}
          />
        ),
      };
    }

    return {
      label: getNavigationMenuItemLabel(
        navigationMenuItem,
        objectMetadataItems,
        views,
      ),
      icon: getStartIcon(navigationMenuItem),
    };
  };

  const handleClick = (navigationMenuItemId: string) => {
    restoreHiddenNavigationMenuItem({
      navigationMenuItemId,
      fallbackParentId: containerId,
    });
    closeDropdown(dropdownId);
  };

  return (
    <>
      <Dropdown.Separator />
      <Dropdown.Section label={t`Hidden`}>
        {hiddenNavigationMenuItems.map((hiddenNavigationMenuItem) => (
          <NavigationMenuItemSelectableItem
            key={hiddenNavigationMenuItem.id}
            item={{
              id: hiddenNavigationMenuItem.id,
              ...getHiddenItemDisplay(hiddenNavigationMenuItem),
              onClick: () => handleClick(hiddenNavigationMenuItem.id),
            }}
          />
        ))}
      </Dropdown.Section>
    </>
  );
};
