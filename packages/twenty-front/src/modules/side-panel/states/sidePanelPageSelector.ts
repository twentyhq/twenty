import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { type ActiveSidePanelPage } from '@/side-panel/types/SidePanelPage';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { SidePanelPages } from 'twenty-shared/types';

export const sidePanelPageSelector = createAtomSelector<ActiveSidePanelPage>({
  key: 'side-panel/sidePanelPageSelector',
  get: ({ get }) =>
    get(sidePanelNavigationStackState).at(-1)?.page ??
    SidePanelPages.CommandMenuDisplay,
});
