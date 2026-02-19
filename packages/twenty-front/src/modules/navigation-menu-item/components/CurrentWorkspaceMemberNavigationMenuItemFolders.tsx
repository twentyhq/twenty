import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconFolderPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CurrentWorkspaceMemberOrphanNavigationMenuItems } from '@/navigation-menu-item/components/CurrentWorkspaceMemberOrphanNavigationMenuItems';
import { NavigationMenuItemFolders } from '@/navigation-menu-item/components/NavigationMenuItemFolders';
import { NavigationMenuItemSkeletonLoader } from '@/navigation-menu-item/components/NavigationMenuItemSkeletonLoader';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/hooks/useNavigationMenuItemsByFolder';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/hooks/useSortedNavigationMenuItems';
import { isNavigationMenuItemFolderCreatingStateV2 } from '@/navigation-menu-item/states/isNavigationMenuItemFolderCreatingStateV2';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';

export const CurrentWorkspaceMemberNavigationMenuItemFolders = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { userNavigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();

  const [
    isNavigationMenuItemFolderCreating,
    setIsNavigationMenuItemFolderCreating,
  ] = useRecoilStateV2(isNavigationMenuItemFolderCreatingStateV2);

  const loading = useIsPrefetchLoading();

  const { t } = useLingui();

  const { toggleNavigationSection, openNavigationSection } =
    useNavigationSection('Favorites');
  const isNavigationSectionOpen = useFamilyRecoilValueV2(
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
