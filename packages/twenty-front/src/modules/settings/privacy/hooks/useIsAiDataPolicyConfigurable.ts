import { useAvailableAiDataPolicyOptions } from '@/settings/privacy/hooks/useAvailableAiDataPolicyOptions';

// most self-hosted catalogs state no residency or retention, so there is nothing to choose from
export const useIsAiDataPolicyConfigurable = () => {
  const { aiDataResidencies, isZeroDataRetentionAvailable } =
    useAvailableAiDataPolicyOptions();

  return aiDataResidencies.length > 0 || isZeroDataRetentionAvailable;
};
