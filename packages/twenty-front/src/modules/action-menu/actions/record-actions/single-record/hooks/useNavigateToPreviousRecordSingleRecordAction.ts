import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';

export const useNavigateToPreviousRecordSingleRecordAction: ActionHookWithObjectMetadataItem =
  ({ objectMetadataItem }) => {
    const recordId = useSelectedRecordIdOrThrow();

    const { navigateToPreviousRecord } = useRecordShowPagePagination(
      objectMetadataItem.nameSingular,
      recordId,
    );

    return {
      onClick: navigateToPreviousRecord,
    };
  };
