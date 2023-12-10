import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { SnackBarProps } from '../components/SnackBar';

export type SnackBarOptions = SnackBarProps & {
  id: string;
};

type SnackBarState = {
  maxQueue: number;
  queue: SnackBarOptions[];
};

export const snackBarInternalScopedState = createScopedState<SnackBarState>({
  key: 'snackBarState',
  defaultValue: {
    maxQueue: 3,
    queue: [],
  },
});
