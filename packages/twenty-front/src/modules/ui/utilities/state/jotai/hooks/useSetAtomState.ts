import { useSetAtom } from 'jotai';

import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/hooks/useRoutedFlowStateScopeId';
import { type State } from '@/ui/utilities/state/jotai/types/State';
import { getRoutedFlowScopedStateAtom } from '@/ui/utilities/state/jotai/utils/getRoutedFlowScopedStateAtom';

export const useSetAtomState = <ValueType>(
  state: State<ValueType>,
): ((value: ValueType | ((prev: ValueType) => ValueType)) => void) => {
  const scopeId = useRoutedFlowStateScopeId();

  return useSetAtom(getRoutedFlowScopedStateAtom(state, scopeId));
};
