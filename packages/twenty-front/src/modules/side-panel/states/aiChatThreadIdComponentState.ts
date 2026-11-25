import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const aiChatThreadIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'side-panel/ai-chat-thread-id',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
