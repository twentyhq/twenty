import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const startAppConversationTextComponentState =
  createAtomComponentState<string>({
    key: 'side-panel/start-app-conversation-text',
    defaultValue: '',
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
