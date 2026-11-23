import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const askAiSidePanelThreadIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'side-panel/ask-ai-thread-id',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
