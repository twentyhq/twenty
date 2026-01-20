import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type Favorite } from '@/favorites/types/Favorite';
import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { useTransformNavigationMenuItemsToFavorites } from '@/navigation-menu-item/utils/transformNavigationMenuItemsToFavorites';
import { prefetchFavoritesState } from '@/prefetch/states/prefetchFavoritesState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

type PrefetchedFavoritesData = {
  favorites: Favorite[];
  workspaceFavorites: Favorite[];
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedFavoritesData = (): PrefetchedFavoritesData => {
  const isNavigationMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_ENABLED,
  );

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const currentWorkspaceMemberId = currentWorkspaceMember?.id;
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    usePrefetchedNavigationMenuItemsData();

  const prefetchFavorites = useRecoilValue(prefetchFavoritesState);

  const favoritesFromNavigationMenuItems =
    useTransformNavigationMenuItemsToFavorites(navigationMenuItems);
  const workspaceFavoritesFromNavigationMenuItems =
    useTransformNavigationMenuItemsToFavorites(workspaceNavigationMenuItems);

  if (isNavigationMenuItemEnabled) {
    const favorites = favoritesFromNavigationMenuItems.filter(
      (favorite) => favorite.forWorkspaceMemberId === currentWorkspaceMemberId,
    );

    const workspaceFavorites = workspaceFavoritesFromNavigationMenuItems.filter(
      (favorite) =>
        favorite.forWorkspaceMemberId === null ||
        favorite.forWorkspaceMemberId === '',
    );

    return {
      favorites,
      workspaceFavorites,
      currentWorkspaceMemberId,
    };
  }

  const favorites = prefetchFavorites.filter(
    (favorite) => favorite.forWorkspaceMemberId === currentWorkspaceMemberId,
  );

  const workspaceFavorites = prefetchFavorites.filter(
    (favorite) =>
      favorite.forWorkspaceMemberId === null ||
      favorite.forWorkspaceMemberId === '',
  );

  return {
    favorites,
    workspaceFavorites,
    currentWorkspaceMemberId,
  };
};
