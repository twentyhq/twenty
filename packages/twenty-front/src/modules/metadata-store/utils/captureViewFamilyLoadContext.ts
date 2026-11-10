import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { viewFamilyLoadEpochState } from '@/metadata-store/states/viewFamilyLoadEpochState';
import { type createStore } from 'jotai';

export const captureViewFamilyLoadContext = (
  store: ReturnType<typeof createStore>,
) => {
  const startEpoch = store.get(viewFamilyLoadEpochState.atom);
  const startFeatureFlags = store.get(currentWorkspaceState.atom)?.featureFlags;

  return {
    isSuperseded: (): boolean =>
      store.get(viewFamilyLoadEpochState.atom) !== startEpoch ||
      store.get(currentWorkspaceState.atom)?.featureFlags !== startFeatureFlags,
  };
};
