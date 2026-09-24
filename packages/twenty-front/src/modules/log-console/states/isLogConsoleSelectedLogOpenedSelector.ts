import { SidePanelPages } from 'twenty-shared/types';

import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageInfoSelector } from '@/side-panel/states/sidePanelPageInfoSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const isLogConsoleSelectedLogOpenedSelector =
  createAtomSelector<boolean>({
    key: 'isLogConsoleSelectedLogOpenedSelector',
    get: ({ get }) =>
      get(isSidePanelOpenedState) &&
      get(sidePanelPageInfoSelector).page === SidePanelPages.LogDetail,
  });
