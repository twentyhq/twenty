import { Snapshot } from 'recoil';

import { RecoilScopedState } from '../types/RecoilScopedState';

import { getScopedState } from './getScopedState';

export const getSnapshotScopedValue = <StateType>(
  snapshot: Snapshot,
  scopedState: RecoilScopedState<StateType>,
  scopeId: string,
) => {
  return snapshot.getLoadable(getScopedState(scopedState, scopeId)).getValue();
};
