import { SingleRecordActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/SingleRecordActionHook';
import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isNull } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useAddToFavoritesSingleRecordAction: SingleRecordActionHookWithObjectMetadataItem =
  ({ recordId, objectMetadataItem }) => {
    const { sortedFavorites: favorites } = useFavorites();

    const { createFavorite } = useCreateFavorite();

    const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

    const foundFavorite = favorites?.find(
      (favorite) => favorite.recordId === recordId,
    );

    const isFavorite = !!foundFavorite;

    const shouldBeRegistered =
      isDefined(objectMetadataItem) &&
      isDefined(selectedRecord) &&
      !objectMetadataItem.isRemote &&
      !isFavorite &&
      isNull(selectedRecord.deletedAt);

    const onClick = () => {
      if (!shouldBeRegistered) {
        return;
      }

      createFavorite(selectedRecord, objectMetadataItem.nameSingular);
    };

    return {
      shouldBeRegistered,
      onClick,
    };
  };
