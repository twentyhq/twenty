import { useEffect } from 'react';
import { useWorkflowSingleRecordActions } from '../hooks/useWorkflowSingleRecordActions';

export const WorkflowSingleRecordActionMenuEntrySetterEffect = ({
  startPosition,
}: {
  startPosition: number;
}) => {
  const { registerSingleRecordActions, unregisterSingleRecordActions } =
    useWorkflowSingleRecordActions();

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
