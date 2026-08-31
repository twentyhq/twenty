import { useAtomValue as useJotaiAtomValue } from 'jotai';

import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/hooks/useRoutedFlowStateScopeId';
import { type Selector } from '@/ui/utilities/state/jotai/types/Selector';
import { type State } from '@/ui/utilities/state/jotai/types/State';
import { type WritableSelector } from '@/ui/utilities/state/jotai/types/WritableSelector';
import { getRoutedFlowScopedStateAtom } from '@/ui/utilities/state/jotai/utils/getRoutedFlowScopedStateAtom';

export const useAtomStateValue = <ValueType>(
  state: State<ValueType> | Selector<ValueType> | WritableSelector<ValueType>,
): ValueType => {
  const scopeId = useRoutedFlowStateScopeId();

  return useJotaiAtomValue(
    state.type === 'State'
      ? getRoutedFlowScopedStateAtom(state, scopeId)
      : state.atom,
  );
};
