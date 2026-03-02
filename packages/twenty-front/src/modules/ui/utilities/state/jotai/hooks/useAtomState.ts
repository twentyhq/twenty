import { useAtom } from 'jotai';

import { type State } from '@/ui/utilities/state/jotai/types/State';
import { type WritableSelector } from '@/ui/utilities/state/jotai/types/WritableSelector';

export const useAtomState = <ValueType>(
  state: State<ValueType> | WritableSelector<ValueType>,
): [
  ValueType,
  (value: ValueType | ((prev: ValueType) => ValueType)) => void,
] => {
  return useAtom(state.atom);
};
