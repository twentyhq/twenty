import { type State } from '@/ui/utilities/state/jotai/types/State';

export const getRoutedFlowScopedStateAtom = <ValueType>(
  state: State<ValueType>,
  scopeId: string | null,
) =>
  state.scope === 'routed-flow' && scopeId !== null
    ? state.atomForRoutedFlow(scopeId)
    : state.atom;
