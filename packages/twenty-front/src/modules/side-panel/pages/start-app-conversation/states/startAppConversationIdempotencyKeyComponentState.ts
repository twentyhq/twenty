import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const startAppConversationIdempotencyKeyComponentState =
  createAtomComponentState<string | null>({
    key: 'side-panel/start-app-conversation-idempotency-key',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
