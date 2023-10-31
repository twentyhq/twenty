import { RecoilState, RecoilValueReadOnly, Snapshot } from 'recoil';

export const getSnapshotStateValue = <StateType>(
  snapshot: Snapshot,
  state: RecoilState<StateType> | RecoilValueReadOnly<StateType>,
) => {
  return snapshot.getLoadable(state).getValue();
};
