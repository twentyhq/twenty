import { createState } from '@ui/utilities/state/utils/createState';

import { RightDrawerPages } from '../types/RightDrawerPages';

export const rightDrawerPageState = createState<RightDrawerPages | null>({
  key: 'ui/layout/right-drawer-page',
  defaultValue: null,
});
