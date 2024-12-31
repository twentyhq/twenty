import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { isDefined } from 'twenty-ui';

export const useRemoveFromFavoritesSingleRecordAction: ActionHookWithObjectMetadataItem =
  ({ objectMetadataItem }) => {
    const recordId = useSelectedRecordIdOrThrow();

    const { sortedFavorites: favorites } = useFavorites();

    const { deleteFavorite } = useDeleteFavorite();

    const foundFavorite = favorites?.find(
      (favorite) => favorite.recordId === recordId,
    );

    const isFavorite = !!foundFavorite;

    const shouldBeRegistered =
      isDefined(objectMetadataItem) &&
      !objectMetadataItem.isRemote &&
      isFavorite;

    const onClick = () => {
      if (!shouldBeRegistered) {
        return;
      }

      deleteFavorite(foundFavorite.id);
    };

    return {
      shouldBeRegistered,
      onClick,
    };
  };
