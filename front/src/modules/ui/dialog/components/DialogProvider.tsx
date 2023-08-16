import { useRecoilState } from 'recoil';

import { dialogInternalState } from '../states/dialogState';

import { Dialog } from './Dialog';

export function DialogProvider({ children }: React.PropsWithChildren) {
  const [dialogState, setDialogState] = useRecoilState(dialogInternalState);

  // Handle dialog close event
  const handleDialogClose = (id: string) => {
    setDialogState((prevState) => ({
      ...prevState,
      queue: prevState.queue.filter((snackBar) => snackBar.id !== id),
    }));
  };

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
