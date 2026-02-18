import { useAtom } from 'jotai';

import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';
import { type WritableSelectorV2 } from '@/ui/utilities/state/jotai/types/WritableSelectorV2';

export const useRecoilStateV2 = <ValueType>(
  state: StateV2<ValueType> | WritableSelectorV2<ValueType>,
): [
  ValueType,
  (value: ValueType | ((prev: ValueType) => ValueType)) => void,
] => {
  return useAtom(state.atom);
};
