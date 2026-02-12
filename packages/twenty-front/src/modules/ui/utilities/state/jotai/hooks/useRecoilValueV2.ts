import { useAtomValue } from 'jotai';

import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

// V2 (Jotai-backed) equivalent of Recoil's `useRecoilValue`.
// Subscribes to a `StateV2<T>` and returns its current value.
export const useRecoilValueV2 = <ValueType>(
  state: StateV2<ValueType>,
): ValueType => {
  return useAtomValue(state.atom);
};
