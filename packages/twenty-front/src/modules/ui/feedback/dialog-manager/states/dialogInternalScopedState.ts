import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { DialogOptions } from '../types/DialogOptions';

type DialogState = {
  maxQueue: number;
  queue: DialogOptions[];
};

export const dialogInternalScopedState = createComponentState<DialogState>({
  key: 'dialog/internal-state',
  defaultValue: {
    maxQueue: 2,
    queue: [],
  },
});
