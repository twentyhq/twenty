import { useAtom } from 'jotai';

import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { type State } from '@/ui/utilities/state/jotai/types/State';
import { type WritableSelector } from '@/ui/utilities/state/jotai/types/WritableSelector';

export const useAtomState = <ValueType>(
  state: State<ValueType> | WritableSelector<ValueType>,
): [
  ValueType,
  (value: ValueType | ((prev: ValueType) => ValueType)) => void,
] => {
  const scopeId = useRoutedFlowStateScopeId();

  return useAtom(state.type === 'State' ? state.getAtom(scopeId) : state.atom);
};
