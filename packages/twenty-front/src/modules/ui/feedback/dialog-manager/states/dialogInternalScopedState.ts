import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { DialogOptions } from '../types/DialogOptions';

type DialogState = {
  maxQueue: number;
  queue: DialogOptions[];
};

export const dialogInternalScopedState = createStateScopeMap<DialogState>({
  key: 'dialog/internal-state',
  defaultValue: {
    maxQueue: 2,
    queue: [],
  },
});
