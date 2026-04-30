import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentAiChatThreadState = createAtomState<string | null>({
  key: 'ai/currentAiChatThreadState',
  defaultValue: null,
});
