import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { IconHeart, IconHeartOff, isDefined } from 'twenty-ui';

export const ManageFavoritesActionEffect = ({
  position,
}: {
  position: number;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );
  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
  );

  const { favorites, createFavorite, deleteFavorite } = useFavorites();

  const selectedRecordId = contextStoreTargetedRecordIds[0];

  const selectedRecord = useRecoilValue(
    recordStoreFamilyState(selectedRecordId),
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataId,
  });

  const foundFavorite = favorites?.find(
    (favorite) => favorite.recordId === selectedRecordId,
  );

  const isFavorite = !!selectedRecordId && !!foundFavorite;

  useEffect(() => {
    if (!isDefined(objectMetadataItem) || objectMetadataItem.isRemote) {
      return;
    }

    addActionMenuEntry({
      key: 'manage-favorites',
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

    return () => {
      removeActionMenuEntry('manage-favorites');
    };
  }, [
    addActionMenuEntry,
    createFavorite,
    deleteFavorite,
    foundFavorite?.id,
    isFavorite,
    objectMetadataItem,
    position,
    removeActionMenuEntry,
    selectedRecord,
  ]);

  return null;
};
