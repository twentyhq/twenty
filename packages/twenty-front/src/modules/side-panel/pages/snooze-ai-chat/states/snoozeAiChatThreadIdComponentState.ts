import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const snoozeAiChatThreadIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'side-panel/snooze-ai-chat-thread-id',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
