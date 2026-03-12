import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { type SidePanelSubPageEntry } from '@/side-panel/types/SidePanelSubPageEntry';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const sidePanelSubPageStackComponentState = createAtomComponentState<
  SidePanelSubPageEntry[]
>({
  key: 'side-panel/sub-page-stack',
  defaultValue: [],
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
