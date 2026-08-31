import { useAtom } from 'jotai';

import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/hooks/useRoutedFlowStateScopeId';
import { type State } from '@/ui/utilities/state/jotai/types/State';
import { type WritableSelector } from '@/ui/utilities/state/jotai/types/WritableSelector';
import { getRoutedFlowScopedStateAtom } from '@/ui/utilities/state/jotai/utils/getRoutedFlowScopedStateAtom';

export const useAtomState = <ValueType>(
  state: State<ValueType> | WritableSelector<ValueType>,
): [
  ValueType,
  (value: ValueType | ((prev: ValueType) => ValueType)) => void,
] => {
  const scopeId = useRoutedFlowStateScopeId();

  return useAtom(
    state.type === 'State'
      ? getRoutedFlowScopedStateAtom(state, scopeId)
      : state.atom,
  );
};
