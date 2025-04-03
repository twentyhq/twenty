import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const AddToFavoritesSingleRecordActionEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const recordId = useSelectedRecordIdOrThrow();

  const { createFavorite } = useCreateFavorite();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  useEffect(() => {
    if (!isDefined(selectedRecord)) {
      return;
    }

    createFavorite(selectedRecord, objectMetadataItem.nameSingular);
  }, [selectedRecord, objectMetadataItem.nameSingular, createFavorite]);

  return null;
};
