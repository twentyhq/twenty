import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const composeEmailDefaultBccComponentState =
  createAtomComponentState<string>({
    key: 'side-panel/compose-email-default-bcc',
    defaultValue: '',
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
