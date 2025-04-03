import { RecordConfigAction } from '@/action-menu/actions/types/RecordConfigAction';
import { wrapActionInCallbacks } from '@/action-menu/actions/utils/wrapActionInCallbacks';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
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

  useEffect(() => {
    addActionMenuEntry(wrappedAction);

    return () => {
      removeActionMenuEntry(wrappedAction.key);
    };
  }, [addActionMenuEntry, removeActionMenuEntry, wrappedAction]);

  return null;
};
