import { useEffect } from 'react';

import { CORE_WORKFLOWS_DELETE_CONFIRMATION_DIALOG_ID } from '@/object-core/commands/constants/CoreWorkflowsDeleteConfirmationDialogId';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

export const CoreWorkflowsDeleteConfirmationDialogCleanupEffect = () => {
  const { closeDialog } = useDialog();

  useEffect(
    () => () => closeDialog(CORE_WORKFLOWS_DELETE_CONFIRMATION_DIALOG_ID),
    [closeDialog],
  );

  return null;
};
