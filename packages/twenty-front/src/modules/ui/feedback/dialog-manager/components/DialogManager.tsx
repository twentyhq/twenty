import { dialogInternalComponentState } from '@/ui/feedback/dialog-manager/states/dialogInternalComponentState';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';

import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { Dialog } from './Dialog';
import { DialogManagerEffect } from './DialogManagerEffect';

export const DialogManager = ({ children }: React.PropsWithChildren) => {
  const dialogInternal = useRecoilComponentValueV2(
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
