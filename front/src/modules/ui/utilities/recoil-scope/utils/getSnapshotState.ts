import { RecoilState, Snapshot } from 'recoil';

export function getSnapshotState<T>({
  snapshot,
  state,
}: {
  snapshot: Snapshot;
  state: RecoilState<T>;
}) {
  return snapshot.getLoadable(state).valueOrThrow();
}
