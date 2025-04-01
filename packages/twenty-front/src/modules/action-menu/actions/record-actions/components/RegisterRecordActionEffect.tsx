import { ActionHook } from '@/action-menu/actions/types/ActionHook';
import { ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { wrapActionInCallbacks } from '@/action-menu/actions/utils/wrapActionInCallbacks';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { useShouldActionBeRegisteredParams } from '@/action-menu/hooks/useShouldActionBeRegisteredParams';
import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useContext, useEffect } from 'react';

type RegisterRecordActionEffectProps = {
  action: ActionMenuEntry & {
    useAction: ActionHook;
    shouldBeRegistered: (params: ShouldBeRegisteredFunctionParams) => boolean;
  };
  objectMetadataItem: ObjectMetadataItem;
};

export const RegisterRecordActionEffect = ({
  action,
  objectMetadataItem,
}: RegisterRecordActionEffectProps) => {
  const { onClick, ConfirmationModal } = action.useAction({
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

  const params = useShouldActionBeRegisteredParams({
    objectMetadataItem,
  });

  const shouldBeRegistered = action.shouldBeRegistered(params);

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
