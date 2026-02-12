import { useAtom } from 'jotai';

import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

// V2 (Jotai-backed) equivalent of Recoil's `useRecoilState`.
// Returns a [value, setter] tuple for a `StateV2<T>`.
export const useRecoilStateV2 = <ValueType>(
  state: StateV2<ValueType>,
): [
  ValueType,
  (value: ValueType | ((prev: ValueType) => ValueType)) => void,
] => {
  return useAtom(state.atom);
};
