import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const sidePanelRoutedPagePathComponentState = createAtomComponentState<
  string | null
>({
  key: 'side-panel/routed-page-path',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
