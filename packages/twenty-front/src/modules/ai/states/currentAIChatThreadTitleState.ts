import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentAIChatThreadTitleState = createAtomState<string | null>({
  key: 'ai/currentAIChatThreadTitleState',
  defaultValue: null,
});
