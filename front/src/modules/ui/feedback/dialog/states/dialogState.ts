import { atom, selector } from 'recoil';

import { DialogProps } from '../components/Dialog';

export type DialogOptions = DialogProps & {
  id: string;
};

export type DialogState = {
  maxQueue: number;
  queue: DialogOptions[];
};

export const dialogInternalState = atom<DialogState>({
  key: 'dialog/internal-state',
  default: {
    maxQueue: 2,
    queue: [],
  },
});

export const dialogSetQueueState = selector<DialogOptions | null>({
  key: 'dialog/queue-state',
  get: ({ get: _get }) => null, // We don't care about getting the value
  set: ({ set }, newValue) =>
    set(dialogInternalState, (prev) => {
      if (prev.queue.length >= prev.maxQueue) {
        return {
          ...prev,
          queue: [...prev.queue.slice(1), newValue] as DialogOptions[],
        };
      }

      return {
        ...prev,
        queue: [...prev.queue, newValue] as DialogOptions[],
      };
    }),
});
