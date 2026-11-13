import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const snoozeInboxThreadIdsComponentState = createAtomComponentState<
  string[]
>({
  key: 'side-panel/snooze-ai-chat-thread-ids',
  defaultValue: [],
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
