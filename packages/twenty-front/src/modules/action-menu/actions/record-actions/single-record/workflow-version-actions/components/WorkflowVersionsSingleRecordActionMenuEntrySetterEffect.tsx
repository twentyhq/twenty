import { NUMBER_OF_STANDARD_SINGLE_RECORD_ACTIONS_ON_ALL_OBJECTS } from '@/action-menu/actions/record-actions/single-record/constants/NumberOfStandardSingleRecordActionsOnAllObjects';
import { useWorkflowVersionsSingleRecordActions } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useWorkflowVersionsSingleRecordActions';
import { useEffect } from 'react';

export const WorkflowVersionsSingleRecordActionMenuEntrySetterEffect = () => {
  const { registerSingleRecordActions, unregisterSingleRecordActions } =
    useWorkflowVersionsSingleRecordActions();

  useEffect(() => {
    registerSingleRecordActions({
      startPosition:
        NUMBER_OF_STANDARD_SINGLE_RECORD_ACTIONS_ON_ALL_OBJECTS + 1,
    });

    return () => {
      unregisterSingleRecordActions();
    };
  }, [registerSingleRecordActions, unregisterSingleRecordActions]);

  return null;
};
