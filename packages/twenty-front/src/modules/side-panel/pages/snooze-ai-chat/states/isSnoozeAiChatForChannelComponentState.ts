import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const isSnoozeAiChatForChannelComponentState =
  createAtomComponentState<boolean>({
    key: 'side-panel/is-snooze-ai-chat-for-channel',
    defaultValue: false,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
