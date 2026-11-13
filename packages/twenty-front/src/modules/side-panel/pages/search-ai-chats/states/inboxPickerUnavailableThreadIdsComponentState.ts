import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const inboxPickerUnavailableThreadIdsComponentState =
  createAtomComponentState<string[]>({
    key: 'side-panel/ai-chat-picker-unavailable-thread-ids',
    defaultValue: [],
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
