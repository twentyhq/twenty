import { useSetAtom } from 'jotai';

import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { type State } from '@/ui/utilities/state/jotai/types/State';

export const useSetAtomState = <ValueType>(
  state: State<ValueType>,
): ((value: ValueType | ((prev: ValueType) => ValueType)) => void) => {
  const scopeId = useRoutedFlowStateScopeId();

  return useSetAtom(state.getAtom(scopeId));
};
