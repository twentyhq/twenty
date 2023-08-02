import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { DialogOptions, dialogSetQueueState } from '../states/dialogState';

export function useDialog() {
  const setDialogQueue = useSetRecoilState(dialogSetQueueState);

  const enqueueDialog = (options?: Omit<DialogOptions, 'id'>) => {
    setDialogQueue({
      id: uuidv4(),
      ...options,
    });
  };

  return { enqueueDialog };
}
