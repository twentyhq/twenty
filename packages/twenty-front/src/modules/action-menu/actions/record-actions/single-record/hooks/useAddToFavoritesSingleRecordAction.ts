import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';

export const useAddToFavoritesSingleRecordAction: ActionHookWithObjectMetadataItem =
  ({ objectMetadataItem }) => {
    const recordId = useSelectedRecordIdOrThrow();

    const { createFavorite } = useCreateFavorite();

    const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

    const onClick = () => {
      if (!selectedRecord) {
        return;
      }

      createFavorite(selectedRecord, objectMetadataItem.nameSingular);
    };

    return {
      onClick,
    };
  };
