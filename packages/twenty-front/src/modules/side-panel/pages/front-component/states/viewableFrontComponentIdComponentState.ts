import { SidePanelPageComponentInstanceContext } from '@/command-menu/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableFrontComponentIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'command-menu/viewable-front-component-id',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
