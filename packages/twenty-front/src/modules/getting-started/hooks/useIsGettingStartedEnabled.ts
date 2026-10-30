import { billingState } from '@/client-config/states/billingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useIsGettingStartedEnabled = () => {
  const billing = useAtomStateValue(billingState);
  const isGettingStartedFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_GETTING_STARTED_ENABLED,
  );

  return isGettingStartedFeatureEnabled && (billing?.isBillingEnabled ?? false);
};
