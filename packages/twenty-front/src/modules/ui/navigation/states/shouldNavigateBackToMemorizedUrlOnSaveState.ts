import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const shouldNavigateBackToMemorizedUrlOnSaveState = createState<boolean>(
  {
    key: 'shouldNavigateBackToMemorizedUrlOnSaveState',
    defaultValue: false,
  },
);
