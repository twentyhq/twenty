import { RecordAgnosticConfigAction } from '@/action-menu/actions/types/RecordAgnosticConfigAction';
import { wrapActionInCallbacks } from '@/action-menu/actions/utils/wrapActionInCallbacks';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { useContext, useEffect } from 'react';

type RegisterAgnosticRecordActionEffectProps = {
  action: RecordAgnosticConfigAction;
};

export const RegisterAgnosticRecordActionEffect = ({
  action,
}: RegisterAgnosticRecordActionEffectProps) => {
  const { onClick, ConfirmationModal } = action.useAction();

  const shouldBeRegistered = action.shouldBeRegistered({});

  const { onActionStartedCallback, onActionExecutedCallback } =
    useContext(ActionMenuContext);

  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const wrappedAction = wrapActionInCallbacks({
    action: {
      ...action,
      onClick,
      ConfirmationModal,
    },
    onActionStartedCallback,
    onActionExecutedCallback,
  });

  useEffect(() => {
    if (shouldBeRegistered) {
      addActionMenuEntry(wrappedAction);
    }

    return () => {
      removeActionMenuEntry(wrappedAction.key);
    };
  }, [
    addActionMenuEntry,
    removeActionMenuEntry,
    shouldBeRegistered,
    wrappedAction,
  ]);

  return null;
};
