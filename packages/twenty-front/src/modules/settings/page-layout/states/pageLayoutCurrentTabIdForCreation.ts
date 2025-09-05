// This state holds the currently active tab ID in the page layout editor

import { createState } from 'twenty-ui/utilities';

// It's used when creating new widgets to know which tab to add them to
export const pageLayoutCurrentTabIdForCreationState = createState<
  string | null
>({
  key: 'pageLayoutCurrentTabIdForCreationState',
  defaultValue: null,
});
