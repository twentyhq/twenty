import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

import { dialogInternalState } from '../states/dialogState';
import { DialogHotkeyScope } from '../types/DialogHotkeyScope';

import { Dialog } from './Dialog';

export function DialogProvider({ children }: React.PropsWithChildren) {
  const [dialogState, setDialogState] = useRecoilState(dialogInternalState);

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  // Handle dialog close event
  const handleDialogClose = (id: string) => {
    setDialogState((prevState) => ({
      ...prevState,
      queue: prevState.queue.filter((snackBar) => snackBar.id !== id),
    }));
    goBackToPreviousHotkeyScope();
  };

  useEffect(() => {
    if (dialogState.queue.length === 0) {
      return;
    }

    setHotkeyScopeAndMemorizePreviousScope(DialogHotkeyScope.Dialog);
  }, [dialogState.queue, setHotkeyScopeAndMemorizePreviousScope]);

  return (
    <>
      {children}
      {dialogState.queue.map((dialog) => (
        <Dialog
          key={dialog.id}
          {...dialog}
          onClose={() => handleDialogClose(dialog.id)}
        />
      ))}
    </>
  );
}
