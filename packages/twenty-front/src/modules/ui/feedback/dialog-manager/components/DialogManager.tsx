import { DIALOG_MANAGER_CLICK_OUTSIDE_ID } from '@/ui/feedback/dialog-manager/constants/DialogManageClickOutsideId';
import { useDialogManagerScopedStates } from '../hooks/internal/useDialogManagerScopedStates';
import { useDialogManager } from '../hooks/useDialogManager';

import { Dialog } from './Dialog';
import { DialogManagerEffect } from './DialogManagerEffect';

export const DialogManager = ({ children }: React.PropsWithChildren) => {
  const { dialogInternal } = useDialogManagerScopedStates();
  const { closeDialog } = useDialogManager();

  return (
    <>
      <DialogManagerEffect />
      {children}
      {dialogInternal.queue.map(({ buttons, children, id, message, title }) => (
        <Dialog
          key={id}
          data-click-outside-id={DIALOG_MANAGER_CLICK_OUTSIDE_ID}
          {...{ title, message, buttons, id, children }}
          onClose={() => closeDialog(id)}
        />
      ))}
    </>
  );
};
