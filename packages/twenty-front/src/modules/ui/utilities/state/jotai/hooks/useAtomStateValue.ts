import { useAtomValue as useJotaiAtomValue } from 'jotai';

import { type Selector } from '@/ui/utilities/state/jotai/types/Selector';
import { type State } from '@/ui/utilities/state/jotai/types/State';
import { type WritableSelector } from '@/ui/utilities/state/jotai/types/WritableSelector';

export const useAtomStateValue = <ValueType>(
  state: State<ValueType> | Selector<ValueType> | WritableSelector<ValueType>,
): ValueType => {
  return useJotaiAtomValue(state.atom);
};
