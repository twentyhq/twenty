import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { DialogOptions } from '../types/DialogOptions';

type DialogState = {
  maxQueue: number;
  queue: DialogOptions[];
};

export const dialogInternalScopedState = createScopedState<DialogState>({
  key: 'dialog/internal-state',
  defaultValue: {
    maxQueue: 2,
    queue: [],
  },
});
