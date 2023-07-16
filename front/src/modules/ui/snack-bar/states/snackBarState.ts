import { atom, selector } from 'recoil';

import { SnackbarProps } from '../components/SnackBar';

export type SnackBarOptions = SnackbarProps & {
  id: string;
};

export type SnackBarState = {
  maxQueue: number;
  queue: SnackBarOptions[];
};

export const snackBarInternalState = atom<SnackBarState>({
  key: 'snackBarState',
  default: {
    maxQueue: 3,
    queue: [],
  },
});

export const snackBarSetQueueState = selector<SnackBarOptions | null>({
  key: 'snackBarQueueState',
  get: ({ get }) => null, // We don't care about getting the value
  set: ({ set }, newValue) =>
    set(snackBarInternalState, (prev) => {
      if (prev.queue.length >= prev.maxQueue) {
        return {
          ...prev,
          queue: [...prev.queue.slice(1), newValue] as SnackBarOptions[],
        };
      }

      return {
        ...prev,
        queue: [...prev.queue, newValue] as SnackBarOptions[],
      };
    }),
});
