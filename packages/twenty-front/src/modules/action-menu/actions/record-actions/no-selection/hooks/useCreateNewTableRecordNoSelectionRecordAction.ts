import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';

export const useCreateNewTableRecordNoSelectionRecordAction: ActionHookWithObjectMetadataItem =
  ({ objectMetadataItem }) => {
    const { createNewIndexRecord } = useCreateNewIndexRecord({
      objectMetadataItem,
    });

    return {
      onClick: createNewIndexRecord,
    };
  };
