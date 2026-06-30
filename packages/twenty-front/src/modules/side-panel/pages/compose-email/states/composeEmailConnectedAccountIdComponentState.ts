import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const composeEmailConnectedAccountIdComponentState =
  createAtomComponentState<string>({
    key: 'side-panel/compose-email-connected-account-id',
    defaultValue: '',
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
