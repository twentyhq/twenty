import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const threadIdCreatedFromDraftState = createAtomState<string | null>({
  key: 'ai/threadIdCreatedFromDraftState',
  defaultValue: null,
});
