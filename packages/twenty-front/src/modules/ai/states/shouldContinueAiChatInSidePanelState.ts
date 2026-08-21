import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const shouldContinueAiChatInSidePanelState = createAtomState<boolean>({
  key: 'shouldContinueAiChatInSidePanelState',
  defaultValue: false,
});
