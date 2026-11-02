import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useEffect } from 'react';

export const ManagedIframePermissionDialogCleanupEffect = ({
  dialogId,
}: {
  dialogId: string;
}) => {
  const { closeDialog } = useDialog();

  useEffect(() => () => closeDialog(dialogId), [closeDialog, dialogId]);

  return null;
};
