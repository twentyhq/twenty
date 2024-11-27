import { useExportViewNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useExportMultipleRecordsAction';
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
    position: 0,
    objectMetadataItem,
  });

  const registerNoSelectionRecordActions = () => {
    registerExportViewNoSelectionRecordsAction();
  };

  const unregisterNoSelectionRecordActions = () => {
    unregisterExportViewNoSelectionRecordsAction();
  };

  return {
    registerNoSelectionRecordActions,
    unregisterNoSelectionRecordActions,
  };
};
