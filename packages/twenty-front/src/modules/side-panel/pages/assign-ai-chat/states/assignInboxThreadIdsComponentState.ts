import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const assignInboxThreadIdsComponentState = createAtomComponentState<
  string[]
>({
  key: 'side-panel/assign-ai-chat-thread-ids',
  defaultValue: [],
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
