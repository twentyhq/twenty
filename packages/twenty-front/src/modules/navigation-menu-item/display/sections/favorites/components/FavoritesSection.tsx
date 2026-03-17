import { useLingui } from '@lingui/react/macro';
import { IconFolderPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { isNavigationMenuItemFolderCreatingState } from '@/navigation-menu-item/common/states/isNavigationMenuItemFolderCreatingState';
import { NavigationMenuItemFolders } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolders';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { NavigationMenuItemOrphanItems } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemOrphanItems';
import { NavigationMenuItemSection } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemSection';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const FavoritesSection = () => {
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { userNavigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();

  const [
    isNavigationMenuItemFolderCreating,
    setIsNavigationMenuItemFolderCreating,
  ] = useAtomState(isNavigationMenuItemFolderCreatingState);

  const { t } = useLingui();

  const { toggleNavigationSection, openNavigationSection } =
    useNavigationSection('Favorites');
  const isNavigationSectionOpen = useAtomFamilyStateValue(
    isNavigationSectionOpenFamilyState,
    'Favorites',
  );

  const toggleNewFolder = () => {
    openNavigationSection();
    setIsNavigationMenuItemFolderCreating((current) => !current);
  };

  if (
    navigationMenuItemsSorted.length === 0 &&
    !isNavigationMenuItemFolderCreating &&
    userNavigationMenuItemsByFolder.length === 0
  ) {
    return null;
  }

  return (
    <NavigationMenuItemSection
      title={t`Favorites`}
      isOpen={isNavigationSectionOpen}
      onToggle={toggleNavigationSection}
      rightIcon={
        <LightIconButton
          Icon={IconFolderPlus}
          onClick={toggleNewFolder}
          accent="tertiary"
        />
      }
    >
      <NavigationMenuItemFolders />
      <NavigationMenuItemOrphanItems section={NavigationSections.FAVORITES} />
    </NavigationMenuItemSection>
  );
};
