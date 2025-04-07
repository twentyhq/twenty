import { RegisterAgnosticActionEffect } from '@/action-menu/actions/record-agnostic-actions/components/RegisterAgnosticActionEffect';
import { useRunWorkflowActions } from '@/action-menu/actions/record-agnostic-actions/run-workflow-actions/hooks/useRunWorkflowActions';

export const RunWorkflowRecordAgnosticActionMenuEntriesSetter = () => {
  const { runWorkflowActions } = useRunWorkflowActions();

  return (
    <>
      {runWorkflowActions.map((action) => (
        <RegisterAgnosticActionEffect key={action.key} action={action} />
      ))}
    </>
  );
};
