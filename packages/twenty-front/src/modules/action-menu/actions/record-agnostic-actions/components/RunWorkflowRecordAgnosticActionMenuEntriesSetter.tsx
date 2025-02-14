import { RegisterAgnosticRecordActionEffect } from '@/action-menu/actions/record-agnostic-actions/components/RegisterAgnosticRecordActionEffect';
import { useRunWorkflowActions } from '@/action-menu/actions/record-agnostic-actions/run-workflow-actions/hooks/useRunWorkflowActions';

export const RunWorkflowRecordAgnosticActionMenuEntriesSetter = () => {
  const { runWorkflowActions } = useRunWorkflowActions();

  return (
    <>
      {runWorkflowActions.map((action) => (
        <RegisterAgnosticRecordActionEffect key={action.key} action={action} />
      ))}
    </>
  );
};
