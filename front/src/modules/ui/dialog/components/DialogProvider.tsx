import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

import { dialogInternalState } from '../states/dialogState';
import { DialogHotkeyScope } from '../types/DialogHotkeyScope';

import { Dialog } from './Dialog';

export function DialogProvider({ children }: React.PropsWithChildren) {
  const [dialogInternal, setDialogInternal] =
    useRecoilState(dialogInternalState);

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  // Handle dialog close event
  const handleDialogClose = (id: string) => {
    setDialogInternal((prevState) => ({
      ...prevState,
      queue: prevState.queue.filter((snackBar) => snackBar.id !== id),
    }));
    goBackToPreviousHotkeyScope();
  };

  useEffect(() => {
    if (dialogInternal.queue.length === 0) {
      return;
    }

    setHotkeyScopeAndMemorizePreviousScope(DialogHotkeyScope.Dialog);
  }, [dialogInternal.queue, setHotkeyScopeAndMemorizePreviousScope]);

  return (
    <>
      {children}
      {dialogInternal.queue.map((dialog) => (
        <Dialog
          key={dialog.id}
          {...dialog}
          onClose={() => handleDialogClose(dialog.id)}
        />
      ))}
    </>
  );
}
