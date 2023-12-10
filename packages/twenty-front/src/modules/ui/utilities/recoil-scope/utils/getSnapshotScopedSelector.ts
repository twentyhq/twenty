import { Snapshot } from 'recoil';

import { RecoilScopedSelector } from '../types/RecoilScopedSelector';

import { getScopedSelector } from './getScopedSelector';

export const getSnapshotScopedSelector = <StateType>(
  snapshot: Snapshot,
  scopedState: RecoilScopedSelector<StateType>,
  scopeId: string,
) => {
  return snapshot
    .getLoadable(getScopedSelector(scopedState, scopeId))
    .getValue();
};
