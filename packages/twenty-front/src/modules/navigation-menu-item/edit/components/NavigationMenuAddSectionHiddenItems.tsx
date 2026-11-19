import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useHiddenNavigationMenuItemsInTab } from '@/navigation-menu-item/edit/hooks/useHiddenNavigationMenuItemsInTab';
import { useRestoreHiddenNavigationMenuItem } from '@/navigation-menu-item/edit/hooks/useRestoreHiddenNavigationMenuItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
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

  const getLabel = (navigationMenuItem: NavigationMenuItem) => {
    const builtInSection = NAVIGATION_MENU_BUILT_IN_SECTIONS.find(
      ({ key }) => key === navigationMenuItem.builtInSectionKey,
    );

    return isDefined(builtInSection)
      ? t(builtInSection.label)
      : getNavigationMenuItemLabel(
          navigationMenuItem,
          objectMetadataItems,
          views,
        );
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
              label: getLabel(hiddenNavigationMenuItem),
              onClick: () => handleClick(hiddenNavigationMenuItem.id),
            }}
          />
        ))}
      </Dropdown.Section>
    </>
  );
};
