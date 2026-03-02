import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconFolderPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { CurrentWorkspaceMemberOrphanNavigationMenuItems } from '@/navigation-menu-item/components/CurrentWorkspaceMemberOrphanNavigationMenuItems';
import { NavigationMenuItemFolders } from '@/navigation-menu-item/components/NavigationMenuItemFolders';
import { NavigationMenuItemSkeletonLoader } from '@/navigation-menu-item/components/NavigationMenuItemSkeletonLoader';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/hooks/useNavigationMenuItemsByFolder';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/hooks/useSortedNavigationMenuItems';
import { isNavigationMenuItemFolderCreatingState } from '@/navigation-menu-item/states/isNavigationMenuItemFolderCreatingState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const CurrentWorkspaceMemberNavigationMenuItemFolders = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { userNavigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();

  const [
    isNavigationMenuItemFolderCreating,
    setIsNavigationMenuItemFolderCreating,
  ] = useAtomState(isNavigationMenuItemFolderCreatingState);

  const loading = useIsPrefetchLoading();

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

  if (loading && isDefined(currentWorkspaceMember)) {
    return <NavigationMenuItemSkeletonLoader />;
  }

  if (
    (!navigationMenuItemsSorted || navigationMenuItemsSorted.length === 0) &&
    !isNavigationMenuItemFolderCreating &&
    (!userNavigationMenuItemsByFolder ||
      userNavigationMenuItemsByFolder.length === 0)
  ) {
    return null;
  }

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={t`Favorites`}
          onClick={toggleNavigationSection}
          rightIcon={
            <LightIconButton
              Icon={IconFolderPlus}
              onClick={toggleNewFolder}
              accent="tertiary"
            />
          }
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      {isNavigationSectionOpen && (
        <>
          <NavigationMenuItemFolders
            isNavigationSectionOpen={isNavigationSectionOpen}
          />
          <CurrentWorkspaceMemberOrphanNavigationMenuItems />
        </>
      )}
    </NavigationDrawerSection>
  );
};
