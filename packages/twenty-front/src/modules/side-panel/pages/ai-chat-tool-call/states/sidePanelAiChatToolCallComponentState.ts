import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const sidePanelAiChatToolCallComponentState = createAtomComponentState<{
  threadId: string;
  toolCallId: string;
} | null>({
  key: 'side-panel/ai-chat-tool-call',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
