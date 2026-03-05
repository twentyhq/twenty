import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentAIChatThreadState = createAtomState<string | null>({
  key: 'ai/currentAIChatThreadState',
  defaultValue: null,
});
