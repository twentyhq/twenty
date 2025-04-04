import { RegisterAgnosticActionEffect } from '@/action-menu/actions/record-agnostic-actions/components/RegisterAgnosticActionEffect';
import { useRegisteredRecordAgnosticActions } from '@/action-menu/hooks/useRegisteredRecordAgnosticActions';

export const RecordAgnosticActionMenuEntriesSetter = () => {
  const actionsToRegister = useRegisteredRecordAgnosticActions();

  return (
    <>
      {actionsToRegister.map((action) => (
        <RegisterAgnosticActionEffect key={action.key} action={action} />
      ))}
    </>
  );
};
