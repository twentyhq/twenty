import { useSetAtom } from 'jotai';

import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

export const useSetRecoilStateV2 = <ValueType>(
  state: StateV2<ValueType>,
): ((value: ValueType | ((prev: ValueType) => ValueType)) => void) => {
  return useSetAtom(state.atom);
};
