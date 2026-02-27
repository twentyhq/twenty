import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const mountedHeadlessFrontComponentIdsState = createAtomState<
  Set<string>
>({
  key: 'mountedHeadlessFrontComponentIdsState',
  defaultValue: new Set(),
});
