import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';

export const useDeleteFavorite = () => {
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();

  const deleteFavorite = async (favoriteId: string) => {
    await deleteNavigationMenuItem(favoriteId);
  };

  return { deleteFavorite };
};
