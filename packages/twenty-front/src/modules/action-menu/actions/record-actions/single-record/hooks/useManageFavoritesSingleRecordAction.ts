import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';
import { IconHeart, IconHeartOff, isDefined } from 'twenty-ui';

export const useManageFavoritesSingleRecordAction = ({
  recordId,
  objectMetadataItem,
}: {
  recordId: string;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const { sortedFavorites: favorites } = useFavorites();

  const { createFavorite } = useCreateFavorite();

  const { deleteFavorite } = useDeleteFavorite();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const foundFavorite = favorites?.find(
    (favorite) => favorite.recordId === recordId,
  );

  const isFavorite = !!foundFavorite;

  const registerManageFavoritesSingleRecordAction = ({
    position,
  }: {
    position: number;
  }) => {
    if (!isDefined(objectMetadataItem) || objectMetadataItem.isRemote) {
      return;
    }

    addActionMenuEntry({
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      key: 'manage-favorites-single-record',
      label: isFavorite ? 'Remove from favorites' : 'Add to favorites',
      position,
      Icon: isFavorite ? IconHeartOff : IconHeart,
      onClick: () => {
        if (isFavorite && isDefined(foundFavorite?.id)) {
          deleteFavorite(foundFavorite.id);
        } else if (isDefined(selectedRecord)) {
          createFavorite(selectedRecord, objectMetadataItem.nameSingular);
        }
      },
    });
  };

  const unregisterManageFavoritesSingleRecordAction = () => {
    removeActionMenuEntry('manage-favorites-single-record');
  };

  return {
    registerManageFavoritesSingleRecordAction,
    unregisterManageFavoritesSingleRecordAction,
  };
};
