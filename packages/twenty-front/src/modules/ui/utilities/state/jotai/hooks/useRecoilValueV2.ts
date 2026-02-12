import { useAtomValue } from 'jotai';

import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

export const useRecoilValueV2 = <ValueType>(
  state: StateV2<ValueType>,
): ValueType => {
  return useAtomValue(state.atom);
};
