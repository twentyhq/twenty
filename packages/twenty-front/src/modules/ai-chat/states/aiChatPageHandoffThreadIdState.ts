import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatPageHandoffThreadIdState = createAtomState<string | null>({
  key: 'aiChatPageHandoffThreadIdState',
  defaultValue: null,
});
