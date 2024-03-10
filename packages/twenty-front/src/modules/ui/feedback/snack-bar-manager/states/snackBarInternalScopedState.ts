import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { SnackBarProps } from '../components/SnackBar';

export type SnackBarOptions = SnackBarProps & {
  id: string;
};

export type SnackBarState = {
  maxQueue: number;
  queue: SnackBarOptions[];
};

export const snackBarInternalScopedState = createComponentState<SnackBarState>({
  key: 'snackBarState',
  defaultValue: {
    maxQueue: 3,
    queue: [],
  },
});
