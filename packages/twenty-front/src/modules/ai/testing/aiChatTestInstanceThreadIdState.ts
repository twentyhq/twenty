import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatTestInstanceThreadIdState = createAtomState<string | null>({
  key: 'ai/aiChatTestInstanceThreadIdState',
  defaultValue: null,
});
