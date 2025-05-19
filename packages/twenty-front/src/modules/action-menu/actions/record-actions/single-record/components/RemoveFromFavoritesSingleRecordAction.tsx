import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { isDefined } from 'twenty-shared/utils';

export const RemoveFromFavoritesSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const { sortedFavorites: favorites } = useFavorites();

  const { deleteFavorite } = useDeleteFavorite();

  const foundFavorite = favorites?.find(
    (favorite) => favorite.recordId === recordId,
  );

  const handleClick = () => {
    if (!isDefined(foundFavorite)) {
      return;
    }

    deleteFavorite(foundFavorite.id);
  };

  return <Action onClick={handleClick} />;
};
