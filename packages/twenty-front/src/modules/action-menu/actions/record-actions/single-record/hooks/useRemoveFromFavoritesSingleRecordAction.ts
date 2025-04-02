import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveFromFavoritesSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const recordId = useSelectedRecordIdOrThrow();

    const { sortedFavorites: favorites } = useFavorites();

    const { deleteFavorite } = useDeleteFavorite();

    const foundFavorite = favorites?.find(
      (favorite) => favorite.recordId === recordId,
    );

    const onClick = () => {
      if (!isDefined(foundFavorite)) {
        return;
      }

      deleteFavorite(foundFavorite.id);
    };

    return {
      onClick,
    };
  };
