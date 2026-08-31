import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ActiveSidePanelPage } from '@/side-panel/types/SidePanelPage';
import { SidePanelPages } from 'twenty-shared/types';

export const sidePanelPageState = createAtomState<ActiveSidePanelPage>({
  key: 'side-panel/sidePanelPageState',
  defaultValue: SidePanelPages.CommandMenuDisplay,
});
