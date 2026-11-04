import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const aiChatPickerOpeningThreadIdComponentState =
  createAtomComponentState<string | null>({
    key: 'side-panel/ai-chat-picker-opening-thread-id',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
