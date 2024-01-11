import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { SnackBarProps } from '../components/SnackBar';

export type SnackBarOptions = SnackBarProps & {
  id: string;
};

export type SnackBarState = {
  maxQueue: number;
  queue: SnackBarOptions[];
};

export const snackBarInternalScopedState = createStateScopeMap<SnackBarState>({
  key: 'snackBarState',
  defaultValue: {
    maxQueue: 3,
    queue: [],
  },
});
