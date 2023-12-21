import { Snapshot } from 'recoil';

import { RecoilScopedState } from '../types/RecoilScopedState';

import { getScopedStateDeprecated } from './getScopedStateDeprecated';

export const getSnapshotScopedValue = <StateType>(
  snapshot: Snapshot,
  scopedState: RecoilScopedState<StateType>,
  scopeId: string,
) => {
  return snapshot
    .getLoadable(getScopedStateDeprecated(scopedState, scopeId))
    .getValue();
};
