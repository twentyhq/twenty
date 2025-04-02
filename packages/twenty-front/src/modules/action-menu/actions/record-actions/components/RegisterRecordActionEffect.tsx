import { RecordConfigAction } from '@/action-menu/actions/types/ConfigAction';
import { wrapActionInCallbacks } from '@/action-menu/actions/utils/wrapActionInCallbacks';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { useShouldActionBeRegisteredParams } from '@/action-menu/hooks/useShouldActionBeRegisteredParams';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useContext, useEffect } from 'react';

type RegisterRecordActionEffectProps = {
  action: RecordConfigAction;
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
