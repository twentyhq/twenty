import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RemoveFromFavoritesSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const { sortedFavorites: favorites } = useFavorites();

  const { deleteFavorite } = useDeleteFavorite();

  const foundFavorite = favorites?.find(
    (favorite) => favorite.recordId === recordId,
  );

  useEffect(() => {
    if (!isDefined(foundFavorite)) {
      return;
    }

    deleteFavorite(foundFavorite.id);
  }, [deleteFavorite, foundFavorite]);

  return null;
};
