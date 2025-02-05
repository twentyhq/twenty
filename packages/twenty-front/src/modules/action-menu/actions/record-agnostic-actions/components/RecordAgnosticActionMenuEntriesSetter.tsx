import { RegisterAgnosticRecordActionEffect } from '@/action-menu/actions/record-agnostic-actions/components/RegisterAgnosticRecordActionEffect';
import { RECORD_AGNOSTIC_ACTIONS_CONFIG } from '@/action-menu/actions/record-agnostic-actions/constants/RecordAgnosticActionsConfig';

export const RecordAgnosticActionMenuEntriesSetter = () => {
  return (
    <>
      {Object.values(RECORD_AGNOSTIC_ACTIONS_CONFIG)
        .sort((a, b) => a.position - b.position)
        .map((action) => (
          <RegisterAgnosticRecordActionEffect
            key={action.key}
            action={action}
          />
        ))}
    </>
  );
};
