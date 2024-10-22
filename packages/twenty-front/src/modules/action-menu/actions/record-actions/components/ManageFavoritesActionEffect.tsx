import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreTargetedRecordsRuleState } from '@/context-store/states/contextStoreTargetedRecordsRuleState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { IconHeart, IconHeartOff, isDefined } from 'twenty-ui';

export const ManageFavoritesActionEffect = ({
  position,
  objectMetadataItem,
}: {
  position: number;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const contextStoreTargetedRecordsRule = useRecoilValue(
    contextStoreTargetedRecordsRuleState,
  );

  const { favorites, createFavorite, deleteFavorite } = useFavorites();

  const selectedRecordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const selectedRecord = useRecoilValue(
    recordStoreFamilyState(selectedRecordId ?? ''),
  );

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
