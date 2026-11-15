import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatDisplayedThreadState = createAtomState<string | null>({
  key: 'ai/aiChatDisplayedThreadState',
  defaultValue: null,
});
