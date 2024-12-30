import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CurrentWorkspaceMemberOrphanFavorites } from '@/favorites/components/CurrentWorkspaceMemberOrphanFavorites';
import { FavoritesDragProvider } from '@/favorites/components/FavoritesDragProvider';
import { FavoriteFolders } from '@/favorites/components/FavoritesFolders';
import { FavoritesSkeletonLoader } from '@/favorites/components/FavoritesSkeletonLoader';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useFavoritesByFolder } from '@/favorites/hooks/useFavoritesByFolder';
import { isFavoriteFolderCreatingState } from '@/favorites/states/isFavoriteFolderCreatingState';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconFolderPlus, LightIconButton, isDefined } from 'twenty-ui';

export const CurrentWorkspaceMemberFavoritesFolders = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { sortedFavorites: favorites } = useFavorites();
  const { favoritesByFolder } = useFavoritesByFolder();

  const [isFavoriteFolderCreating, setIsFavoriteFolderCreating] =
    useRecoilState(isFavoriteFolderCreatingState);

  const loading = useIsPrefetchLoading();

  const {
    toggleNavigationSection,
    isNavigationSectionOpenState,
    openNavigationSection,
  } = useNavigationSection('Favorites');
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);

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
          label="Favorites"
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
        <FavoritesDragProvider>
          <FavoriteFolders isNavigationSectionOpen={isNavigationSectionOpen} />
          <CurrentWorkspaceMemberOrphanFavorites />
        </FavoritesDragProvider>
      )}
    </NavigationDrawerSection>
  );
};
