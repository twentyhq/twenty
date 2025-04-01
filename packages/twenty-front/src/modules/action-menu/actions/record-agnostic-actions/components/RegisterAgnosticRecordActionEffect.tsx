import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { wrapActionInCallbacks } from '@/action-menu/actions/utils/wrapActionInCallbacks';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { useContext, useEffect } from 'react';

type RegisterAgnosticRecordActionEffectProps = {
  action: ActionMenuEntry & {
    useAction: ActionHookWithoutObjectMetadataItem;
    shouldBeRegistered: (params: ShouldBeRegisteredFunctionParams) => boolean;
  };
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
