import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useEffect } from 'react';

export const ManagedIframePermissionDialogEffect = ({
  dialogId,
  hasInvalidRequest,
  onReset,
}: {
  dialogId: string;
  hasInvalidRequest: boolean;
  onReset: (permission: null) => void;
}) => {
  const { closeDialog } = useDialog();

  useEffect(() => () => closeDialog(dialogId), [closeDialog, dialogId]);

  useEffect(() => {
    if (!hasInvalidRequest) {
      return;
    }

    closeDialog(dialogId);
    onReset(null);
  }, [closeDialog, dialogId, hasInvalidRequest, onReset]);

  return null;
};
