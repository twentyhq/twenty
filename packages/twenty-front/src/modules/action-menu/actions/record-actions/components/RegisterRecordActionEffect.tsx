import { ActionHook } from '@/action-menu/actions/types/ActionHook';
import { wrapActionInCallbacks } from '@/action-menu/actions/utils/wrapActionInCallbacks';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useContext, useEffect } from 'react';

type RegisterRecordActionEffectProps = {
  action: ActionMenuEntry & {
    actionHook: ActionHook;
  };
  objectMetadataItem: ObjectMetadataItem;
};

export const RegisterRecordActionEffect = ({
  action,
  objectMetadataItem,
}: RegisterRecordActionEffectProps) => {
  const { shouldBeRegistered, onClick, ConfirmationModal } = action.actionHook({
    objectMetadataItem,
  });

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
