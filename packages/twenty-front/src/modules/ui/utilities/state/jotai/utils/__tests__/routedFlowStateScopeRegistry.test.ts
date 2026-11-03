import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { routedFlowStateScopeRegistry } from '@/ui/utilities/state/jotai/utils/routedFlowStateScopeRegistry';

describe('routedFlowStateScopeRegistry', () => {
  it('keeps one draft until both the main editor and panel flow leave', async () => {
    const state = createAtomState({
      key: 'retained-flow-state-test',
      defaultValue: false,
      scope: 'routed-flow',
    });
    const draft = state.getAtom('main-panel-flow');
    const leaveMain = routedFlowStateScopeRegistry.retain('main-panel-flow');
    const leavePanel = routedFlowStateScopeRegistry.retain('main-panel-flow');
    routedFlowStateScopeRegistry.release('main-panel-flow');
    leaveMain();
    await Promise.resolve();
    expect(state.getAtom('main-panel-flow')).toBe(draft);
    leavePanel();
    await Promise.resolve();
    expect(state.getAtom('main-panel-flow')).not.toBe(draft);
  });

  it('retains the main draft when a panel closes and tolerates repeated cleanup', async () => {
    const state = createAtomState({
      key: 'main-owned-flow-state-test',
      defaultValue: false,
      scope: 'routed-flow',
    });
    const draft = state.getAtom('main-owned-flow');
    const leaveMain = routedFlowStateScopeRegistry.retain('main-owned-flow');
    const leavePanel = routedFlowStateScopeRegistry.retain('main-owned-flow');
    routedFlowStateScopeRegistry.release('main-owned-flow');
    leavePanel();
    leavePanel();
    await Promise.resolve();
    expect(state.getAtom('main-owned-flow')).toBe(draft);
    leaveMain();
    await Promise.resolve();
    expect(state.getAtom('main-owned-flow')).not.toBe(draft);
  });

  it('preserves the same scope across an effect cleanup replay', async () => {
    const state = createAtomState({
      key: 'replayed-flow-state-test',
      defaultValue: false,
      scope: 'routed-flow',
    });
    const draft = state.getAtom('replayed-flow');
    const leaveFirstMount =
      routedFlowStateScopeRegistry.retain('replayed-flow');
    routedFlowStateScopeRegistry.release('replayed-flow');
    leaveFirstMount();
    const leaveReplayedMount =
      routedFlowStateScopeRegistry.retain('replayed-flow');
    await Promise.resolve();
    expect(state.getAtom('replayed-flow')).toBe(draft);
    leaveReplayedMount();
    await Promise.resolve();
    expect(state.getAtom('replayed-flow')).not.toBe(draft);
  });

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

    routedFlowStateScopeRegistry.release('flow-1');

    expect(state.getAtom('flow-1')).not.toBe(stateAtom);
    expect(familyState.getAtom('role-1', 'flow-1')).not.toBe(familyAtom);
    expect(state.getAtom('flow-2')).toBe(otherStateAtom);
  });
});
