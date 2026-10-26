import { type AiChatPickerOpenError } from '@/side-panel/pages/search-ai-chats/types/AiChatPickerOpenError';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const aiChatPickerOpenErrorComponentState =
  createAtomComponentState<AiChatPickerOpenError | null>({
    key: 'side-panel/ai-chat-picker-open-error',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
