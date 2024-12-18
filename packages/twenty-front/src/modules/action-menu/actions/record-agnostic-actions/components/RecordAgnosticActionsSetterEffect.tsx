import { useRecordAgnosticActions } from '@/action-menu/actions/record-agnostic-actions/hooks/useRecordAgnosticActions';
import { useEffect } from 'react';

export const RecordAgnosticActionsSetterEffect = () => {
  const { registerRecordAgnosticActions, unregisterRecordAgnosticActions } =
    useRecordAgnosticActions();

  useEffect(() => {
    registerRecordAgnosticActions();

    return () => {
      unregisterRecordAgnosticActions();
    };
  }, [registerRecordAgnosticActions, unregisterRecordAgnosticActions]);

  return null;
};
