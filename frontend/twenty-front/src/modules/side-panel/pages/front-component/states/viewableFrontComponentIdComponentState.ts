import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableFrontComponentIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'side-panel/viewable-front-component-id',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
