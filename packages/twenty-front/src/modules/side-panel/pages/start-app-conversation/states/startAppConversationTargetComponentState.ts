import { type StartAppConversationTarget } from '@/side-panel/pages/start-app-conversation/types/StartAppConversationTarget';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const startAppConversationTargetComponentState =
  createAtomComponentState<StartAppConversationTarget | null>({
    key: 'side-panel/start-app-conversation-target',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
