import { useSetAtom } from 'jotai';

import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

// V2 (Jotai-backed) equivalent of Recoil's `useSetRecoilState`.
// Returns a setter function for a `StateV2<T>`.
export const useSetRecoilStateV2 = <ValueType>(
  state: StateV2<ValueType>,
): ((value: ValueType | ((prev: ValueType) => ValueType)) => void) => {
  return useSetAtom(state.atom);
};
