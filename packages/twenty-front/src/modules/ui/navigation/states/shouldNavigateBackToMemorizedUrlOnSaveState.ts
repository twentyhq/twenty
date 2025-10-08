import { createState } from 'twenty-ui/utilities';

export const shouldNavigateBackToMemorizedUrlOnSaveState = createState<boolean>(
  {
    key: 'shouldNavigateBackToMemorizedUrlOnSaveState',
    defaultValue: false,
  },
);
