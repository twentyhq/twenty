import { useSetAtom } from 'jotai';

import { type State } from '@/ui/utilities/state/jotai/types/State';

export const useSetAtomState = <ValueType>(
  state: State<ValueType>,
): ((value: ValueType | ((prev: ValueType) => ValueType)) => void) => {
  return useSetAtom(state.atom);
};
