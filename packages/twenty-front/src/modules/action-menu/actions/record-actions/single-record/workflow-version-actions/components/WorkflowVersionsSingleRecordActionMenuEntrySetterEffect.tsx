import { useWorkflowVersionsSingleRecordActions } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useWorkflowVersionsSingleRecordActions';
import { useEffect } from 'react';

export const WorkflowVersionsSingleRecordActionMenuEntrySetterEffect = ({
  startPosition,
}: {
  startPosition: number;
}) => {
  const { registerSingleRecordActions, unregisterSingleRecordActions } =
    useWorkflowVersionsSingleRecordActions();

  useEffect(() => {
    registerSingleRecordActions({ startPosition });

    return () => {
      unregisterSingleRecordActions();
    };
  }, [
    registerSingleRecordActions,
    startPosition,
    unregisterSingleRecordActions,
  ]);

  return null;
};
