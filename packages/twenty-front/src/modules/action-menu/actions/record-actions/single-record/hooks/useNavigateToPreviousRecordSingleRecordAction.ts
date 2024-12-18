import { SingleRecordActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/singleRecordActionHook';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';

export const useNavigateToPreviousRecordSingleRecordAction: SingleRecordActionHookWithObjectMetadataItem =
  ({ recordId, objectMetadataItem }) => {
    const { navigateToPreviousRecord } = useRecordShowPagePagination(
      objectMetadataItem.nameSingular,
      recordId,
    );

    return {
      shouldBeRegistered: true,
      onClick: navigateToPreviousRecord,
    };
  };
