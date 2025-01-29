import { RegisterAgnosticRecordActionEffect } from '@/action-menu/actions/record-agnostic-actions/components/RegisterAgnosticRecordActionEffect';
import { RECORD_AGNOSTIC_ACTIONS_CONFIG } from '@/action-menu/actions/record-agnostic-actions/constants/RecordAgnosticActionsConfig';

export const RecordAgnosticActionMenuEntriesSetter = () => {
  const actionConfig = RECORD_AGNOSTIC_ACTIONS_CONFIG;

  return (
    <>
      {Object.values(actionConfig).map((action) => (
        <RegisterAgnosticRecordActionEffect key={action.key} action={action} />
      ))}
    </>
  );
};
