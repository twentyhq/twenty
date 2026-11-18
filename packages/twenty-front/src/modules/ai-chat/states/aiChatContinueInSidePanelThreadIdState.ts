import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatContinueInSidePanelThreadIdState = createAtomState<
  string | null
>({
  key: 'ai/aiChatContinueInSidePanelThreadIdState',
  defaultValue: null,
});
