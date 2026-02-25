import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

export const AddToFavoritesSingleRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const { createFavorite } = useCreateFavorite();

  const selectedRecord = useAtomFamilyStateValue(
    recordStoreFamilyState,
    recordId,
  );

  const handleClick = () => {
    if (!isDefined(selectedRecord)) {
      return;
    }

    createFavorite(selectedRecord, objectMetadataItem.nameSingular);
  };

  return <Action onClick={handleClick} />;
};
