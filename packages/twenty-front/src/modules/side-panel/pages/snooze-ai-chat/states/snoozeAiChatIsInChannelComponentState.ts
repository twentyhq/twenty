import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Snoozes the chats for their whole channel rather than for the member
export const snoozeAiChatIsInChannelComponentState =
  createAtomComponentState<boolean>({
    key: 'side-panel/snooze-ai-chat-is-in-channel',
    defaultValue: false,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
