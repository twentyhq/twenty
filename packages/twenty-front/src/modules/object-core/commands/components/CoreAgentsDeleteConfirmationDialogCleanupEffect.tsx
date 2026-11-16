import { useEffect } from 'react';

import { CORE_AGENTS_DELETE_CONFIRMATION_DIALOG_ID } from '@/object-core/commands/constants/CoreAgentsDeleteConfirmationDialogId';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

export const CoreAgentsDeleteConfirmationDialogCleanupEffect = () => {
  const { closeDialog } = useDialog();

  useEffect(
    () => () => closeDialog(CORE_AGENTS_DELETE_CONFIRMATION_DIALOG_ID),
    [closeDialog],
  );

  return null;
};
