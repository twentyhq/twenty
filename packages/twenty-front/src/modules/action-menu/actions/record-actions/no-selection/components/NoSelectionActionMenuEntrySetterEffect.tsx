import { useNoSelectionRecordActions } from '@/action-menu/actions/record-actions/no-selection/hooks/useNoSelectionRecordActions';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useEffect } from 'react';

export const NoSelectionActionMenuEntrySetterEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const {
    registerNoSelectionRecordActions,
    unregisterNoSelectionRecordActions,
  } = useNoSelectionRecordActions({
    objectMetadataItem,
  });

  useEffect(() => {
    registerNoSelectionRecordActions();

    return () => {
      unregisterNoSelectionRecordActions();
    };
  }, [registerNoSelectionRecordActions, unregisterNoSelectionRecordActions]);

  return null;
};
