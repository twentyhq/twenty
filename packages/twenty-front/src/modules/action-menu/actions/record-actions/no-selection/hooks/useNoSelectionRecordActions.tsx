import { useExportViewNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useExportViewNoSelectionRecordAction';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useNoSelectionRecordActions = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const {
    registerExportViewNoSelectionRecordsAction,
    unregisterExportViewNoSelectionRecordsAction,
  } = useExportViewNoSelectionRecordAction({
    objectMetadataItem,
  });

  const registerNoSelectionRecordActions = () => {
    registerExportViewNoSelectionRecordsAction({ position: 1 });
  };

  const unregisterNoSelectionRecordActions = () => {
    unregisterExportViewNoSelectionRecordsAction();
  };

  return {
    registerNoSelectionRecordActions,
    unregisterNoSelectionRecordActions,
  };
};
