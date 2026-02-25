import { dialogInternalComponentState } from '@/ui/feedback/dialog-manager/states/dialogInternalComponentState';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';

import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { Dialog } from './Dialog';
import { DialogManagerEffect } from './DialogManagerEffect';

export const DialogManager = ({ children }: React.PropsWithChildren) => {
  const dialogInternal = useAtomComponentStateValue(
    dialogInternalComponentState,
  );
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
