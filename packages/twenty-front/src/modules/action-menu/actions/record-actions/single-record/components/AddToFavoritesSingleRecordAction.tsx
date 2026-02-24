import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useFamilyAtomValue } from '@/ui/utilities/state/jotai/hooks/useFamilyAtomValue';
import { isDefined } from 'twenty-shared/utils';

export const AddToFavoritesSingleRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const { createFavorite } = useCreateFavorite();

  const selectedRecord = useFamilyAtomValue(recordStoreFamilyState, recordId);

  const handleClick = () => {
    if (!isDefined(selectedRecord)) {
      return;
    }

    createFavorite(selectedRecord, objectMetadataItem.nameSingular);
  };

  return <Action onClick={handleClick} />;
};
