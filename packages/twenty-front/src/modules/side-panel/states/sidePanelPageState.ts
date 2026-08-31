import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type SidePanelPage } from '@/side-panel/constants/SidePanelArtifactPage';
import { SidePanelPages } from 'twenty-shared/types';

export const sidePanelPageState = createAtomState<SidePanelPage>({
  key: 'side-panel/sidePanelPageState',
  defaultValue: SidePanelPages.CommandMenuDisplay,
});
