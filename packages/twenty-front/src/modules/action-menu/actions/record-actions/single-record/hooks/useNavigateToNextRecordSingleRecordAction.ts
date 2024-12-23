import { SingleRecordActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/SingleRecordActionHook';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';

export const useNavigateToNextRecordSingleRecordAction: SingleRecordActionHookWithObjectMetadataItem =
  ({ recordId, objectMetadataItem }) => {
    const { navigateToNextRecord } = useRecordShowPagePagination(
      objectMetadataItem.nameSingular,
      recordId,
    );

    return {
      shouldBeRegistered: true,
      onClick: navigateToNextRecord,
    };
  };
