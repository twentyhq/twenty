import { NUMBER_OF_STANDARD_SINGLE_RECORD_ACTIONS_ON_ALL_OBJECTS } from '@/action-menu/actions/record-actions/single-record/constants/NumberOfStandardSingleRecordActionsOnAllObjects';
import { useEffect } from 'react';
import { useWorkflowSingleRecordActions } from '../hooks/useWorkflowSingleRecordActions';

export const WorkflowSingleRecordActionMenuEntrySetterEffect = () => {
  const { registerSingleRecordActions, unregisterSingleRecordActions } =
    useWorkflowSingleRecordActions();

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
