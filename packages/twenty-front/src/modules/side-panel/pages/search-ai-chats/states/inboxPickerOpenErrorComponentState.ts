import { type InboxPickerOpenError } from '@/side-panel/pages/search-ai-chats/types/InboxPickerOpenError';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const inboxPickerOpenErrorComponentState =
  createAtomComponentState<InboxPickerOpenError | null>({
    key: 'side-panel/ai-chat-picker-open-error',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
