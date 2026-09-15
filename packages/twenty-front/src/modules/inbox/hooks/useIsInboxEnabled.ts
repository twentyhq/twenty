import { FeatureFlagKey } from 'twenty-shared/types';

import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const useIsInboxEnabled = () =>
  useIsFeatureEnabled(FeatureFlagKey.IS_INBOX_ENABLED);
