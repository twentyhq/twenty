import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const closingAiChatThreadIdState = createAtomState<string | null>({
  key: 'ai/closingAiChatThreadIdState',
  defaultValue: null,
});
