import { useAtom } from 'jotai';

import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

export const useRecoilStateV2 = <ValueType>(
  state: StateV2<ValueType>,
): [
  ValueType,
  (value: ValueType | ((prev: ValueType) => ValueType)) => void,
] => {
  return useAtom(state.atom);
};
