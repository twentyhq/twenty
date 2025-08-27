import {
  type RecoilState,
  type RecoilValueReadOnly,
  type Snapshot,
} from 'recoil';

export const getSnapshotValue = <StateType>(
  snapshot: Snapshot,
  state: RecoilState<StateType> | RecoilValueReadOnly<StateType>,
) => {
  return snapshot.getLoadable(state).getValue();
};
