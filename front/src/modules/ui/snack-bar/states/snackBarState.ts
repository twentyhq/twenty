import { atom, selector } from 'recoil';

import { SnackBarProps } from '../components/SnackBar';

export type SnackBarOptions = SnackBarProps & {
  id: string;
};

type SnackBarState = {
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

// TODO: use a recoil callback
export const snackBarSetQueueState = selector<SnackBarOptions | null>({
  key: 'snackBarQueueState',
  get: ({ get: _get }) => null, // We don't care about getting the value
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
