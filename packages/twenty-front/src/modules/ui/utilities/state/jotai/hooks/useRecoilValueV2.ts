import { useAtomValue } from 'jotai';

import { type SelectorV2 } from '@/ui/utilities/state/jotai/types/SelectorV2';
import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';
import { type WritableSelectorV2 } from '@/ui/utilities/state/jotai/types/WritableSelectorV2';

export const useRecoilValueV2 = <ValueType>(
  state:
    | StateV2<ValueType>
    | SelectorV2<ValueType>
    | WritableSelectorV2<ValueType>,
): ValueType => {
  return useAtomValue(state.atom);
};
