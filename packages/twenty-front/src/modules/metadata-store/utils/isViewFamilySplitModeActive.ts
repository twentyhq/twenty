import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type createStore } from 'jotai';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const isViewFamilySplitModeActive = (
  store: ReturnType<typeof createStore>,
): boolean =>
  store
    .get(currentWorkspaceState.atom)
    ?.featureFlags?.some(
      (featureFlag) =>
        featureFlag.key === FeatureFlagKey.IS_PRIVATE_METADATA_ENABLED &&
        featureFlag.value === true,
    ) === true;
