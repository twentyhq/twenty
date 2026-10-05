import { parsePath } from 'react-router-dom';
import { v4 } from 'uuid';

import { type SidePanelRoutedLocation } from '@/side-panel/states/sidePanelNavigationStackState';

export const toSidePanelLocation = (
  path: string,
  state: unknown = null,
): SidePanelRoutedLocation => ({
  pathname: '',
  search: '',
  hash: '',
  ...parsePath(path),
  state,
  key: v4(),
});
