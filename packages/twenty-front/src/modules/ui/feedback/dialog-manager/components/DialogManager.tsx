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
          {...{ title, message, buttons, id, children }}
          onClose={() => closeDialog(id)}
        />
      ))}
    </>
  );
};
