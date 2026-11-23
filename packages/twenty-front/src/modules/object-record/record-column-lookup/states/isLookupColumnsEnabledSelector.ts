import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { FeatureFlagKey } from 'twenty-shared/types';

export const isLookupColumnsEnabledSelector = createAtomSelector<boolean>({
  key: 'isLookupColumnsEnabledSelector',
  get: ({ get }) =>
    get(currentWorkspaceState)?.featureFlags?.some(
      (featureFlag) =>
        featureFlag.key === FeatureFlagKey.IS_LOOKUP_COLUMNS_ENABLED &&
        featureFlag.value,
    ) ?? false,
});
