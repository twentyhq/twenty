import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const composeEmailDefaultToComponentState =
  createAtomComponentState<string>({
    key: 'side-panel/compose-email-default-to',
    defaultValue: '',
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
