import { RecoilState, Snapshot } from 'recoil';

export function getSnapshotScopedState<T>({
  snapshot,
  state,
  contextScopeId,
}: {
  snapshot: Snapshot;
  state: (scopeId: string) => RecoilState<T>;
  contextScopeId: string;
}) {
  return snapshot.getLoadable(state(contextScopeId)).valueOrThrow();
}
