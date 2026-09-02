import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { releaseRoutedFlowStateScope } from '@/ui/utilities/state/jotai/utils/routedFlowStateScopeRegistry';

describe('routedFlowStateScopeRegistry', () => {
  it('releases scoped state atoms without touching other scopes', () => {
    const state = createAtomState({
      key: 'scoped-state-test',
      defaultValue: false,
      scope: 'routed-flow',
    });
    const familyState = createAtomFamilyState({
      key: 'scoped-family-state-test',
      defaultValue: false,
      scope: 'routed-flow',
    });
    const stateAtom = state.getAtom('flow-1');
    const otherStateAtom = state.getAtom('flow-2');
    const familyAtom = familyState.getAtom('role-1', 'flow-1');

    releaseRoutedFlowStateScope('flow-1');

    expect(state.getAtom('flow-1')).not.toBe(stateAtom);
    expect(familyState.getAtom('role-1', 'flow-1')).not.toBe(familyAtom);
    expect(state.getAtom('flow-2')).toBe(otherStateAtom);
  });
});
