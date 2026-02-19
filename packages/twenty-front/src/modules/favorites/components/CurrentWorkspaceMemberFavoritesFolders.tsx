import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CurrentWorkspaceMemberOrphanFavorites } from '@/favorites/components/CurrentWorkspaceMemberOrphanFavorites';
import { FavoriteFolders } from '@/favorites/components/FavoritesFolders';
import { FavoritesSkeletonLoader } from '@/favorites/components/FavoritesSkeletonLoader';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useFavoritesByFolder } from '@/favorites/hooks/useFavoritesByFolder';
import { isFavoriteFolderCreatingStateV2 } from '@/favorites/states/isFavoriteFolderCreatingStateV2';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconFolderPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

export const CurrentWorkspaceMemberFavoritesFolders = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { sortedFavorites: favorites } = useFavorites();
  const { favoritesByFolder } = useFavoritesByFolder();

  const [isFavoriteFolderCreating, setIsFavoriteFolderCreating] =
    useRecoilStateV2(isFavoriteFolderCreatingStateV2);

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
    setIsFavoriteFolderCreating((current) => !current);
  };

  if (loading && isDefined(currentWorkspaceMember)) {
    return <FavoritesSkeletonLoader />;
  }

  if (
    (!favorites || favorites.length === 0) &&
    !isFavoriteFolderCreating &&
    (!favoritesByFolder || favoritesByFolder.length === 0)
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
          <FavoriteFolders isNavigationSectionOpen={isNavigationSectionOpen} />
          <CurrentWorkspaceMemberOrphanFavorites />
        </>
      )}
    </NavigationDrawerSection>
  );
};
