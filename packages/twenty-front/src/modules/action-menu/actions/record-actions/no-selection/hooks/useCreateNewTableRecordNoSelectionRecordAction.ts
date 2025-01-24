import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useCreateNewTableRecord } from '@/object-record/record-table/hooks/useCreateNewTableRecords';
import { getRecordIndexIdFromObjectNamePlural } from '@/object-record/utils/getRecordIndexIdFromObjectNamePlural';

export const useCreateNewTableRecordNoSelectionRecordAction: ActionHookWithObjectMetadataItem =
  ({ objectMetadataItem }) => {
    const recordTableId = getRecordIndexIdFromObjectNamePlural(
      objectMetadataItem.namePlural,
    );

    const { createNewTableRecord } = useCreateNewTableRecord({
      objectMetadataItem,
      recordTableId,
    });

    const onClick = () => {
      createNewTableRecord();
    };

    return {
      shouldBeRegistered: true,
      onClick,
    };
  };
