import { RegisterAgnosticRecordActionEffect } from '@/action-menu/actions/record-agnostic-actions/components/RegisterAgnosticRecordActionEffect';
import { RECORD_AGNOSTIC_ACTIONS_CONFIG } from '@/action-menu/actions/record-agnostic-actions/constants/RecordAgnoticActionsConfig';
import { useRunWorkflowActions } from '@/action-menu/actions/record-agnostic-actions/run-workflow-actions/hooks/useRunWorkflowActions';

export const RecordAgnosticActionMenuEntriesSetter = () => {
  const actionConfig = RECORD_AGNOSTIC_ACTIONS_CONFIG;

  const { runWorkflowActions } = useRunWorkflowActions();

  const actions = [...Object.values(actionConfig), ...runWorkflowActions];

  return (
    <>
      {actions.map((action) => (
        <RegisterAgnosticRecordActionEffect key={action.key} action={action} />
      ))}
    </>
  );
};
