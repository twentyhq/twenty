import { type DynamicToolUIPart, type ToolUIPart } from 'ai';

import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const aiChatToolCallPartComponentState = createAtomComponentState<
  ToolUIPart | DynamicToolUIPart | null
>({
  key: 'side-panel/ai-chat-tool-call-part',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
