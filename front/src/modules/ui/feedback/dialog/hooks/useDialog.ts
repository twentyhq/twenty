import { v4 as uuidv4 } from 'uuid';

import { DialogOptions } from '../types/DialogOptions';

import { useDialogManager } from './useDialogManager';

export const useDialog = () => {
  const { setDialogQueue } = useDialogManager();

  const enqueueDialog = (options?: Omit<DialogOptions, 'id'>) => {
    setDialogQueue({
      id: uuidv4(),
      ...options,
    });
  };

  return { enqueueDialog };
};
