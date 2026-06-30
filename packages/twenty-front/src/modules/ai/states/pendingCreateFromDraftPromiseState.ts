import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const pendingCreateFromDraftPromiseState = createAtomState<Promise<
  string | null
> | null>({
  key: 'ai/pendingCreateFromDraftPromiseState',
  defaultValue: null,
});
