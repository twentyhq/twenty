import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { IconHeart, IconHeartOff, isDefined } from 'twenty-ui';

export const ManageFavoritesActionEffect = () => {
  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );
  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
  );

  const setActionMenuEntries = useSetRecoilComponentStateV2(
    actionMenuEntriesComponentState,
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
    if (!isDefined(objectMetadataItem)) {
      return;
    }

    const action = {
      label: isFavorite ? 'Remove from favorites' : 'Add to favorites',
      Icon: isFavorite ? IconHeartOff : IconHeart,
      onClick: () => {
        if (isFavorite) {
          deleteFavorite(foundFavorite.id);
        } else if (isDefined(selectedRecord)) {
          createFavorite(selectedRecord, objectMetadataItem.nameSingular);
        }
      },
    };

    setActionMenuEntries((currentActionMenuEntries) => {
      return new Map(currentActionMenuEntries).set('manage-favorites', action);
    });

    return () => {
      setActionMenuEntries((currentActionMenuEntries) => {
        const newMap = new Map(currentActionMenuEntries);
        newMap.delete('manage-favorites');
        return newMap;
      });
    };
  }, [
    isFavorite,
    selectedRecord,
    objectMetadataItem,
    createFavorite,
    deleteFavorite,
    foundFavorite,
    setActionMenuEntries,
  ]);

  return null;
};
