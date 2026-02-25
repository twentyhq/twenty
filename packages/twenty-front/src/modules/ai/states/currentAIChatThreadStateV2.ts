import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentAIChatThreadStateV2 = createAtomState<string | null>({
  key: 'ai/currentAIChatThreadStateV2',
  defaultValue: null,
});
