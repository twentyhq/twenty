import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useEffect } from 'react';
import { useWorkflowRunRecordActions } from '../hooks/useWorkflowRunRecordActions';

export const WorkflowRunRecordActionMenuEntrySetterEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const {
    registerWorkflowRunRecordActions,
    unregisterWorkflowRunRecordActions,
  } = useWorkflowRunRecordActions({
    objectMetadataItem,
  });

  useEffect(() => {
    registerWorkflowRunRecordActions();

    return () => {
      unregisterWorkflowRunRecordActions();
    };
  }, [registerWorkflowRunRecordActions, unregisterWorkflowRunRecordActions]);

  return null;
};
