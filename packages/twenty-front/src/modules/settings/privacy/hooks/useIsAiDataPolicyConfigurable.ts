import { isNonEmptyArray } from 'twenty-shared/utils';

import { useAvailableAiDataPolicyOptions } from '@/settings/privacy/hooks/useAvailableAiDataPolicyOptions';

export const useIsAiDataPolicyConfigurable = () => {
  const { dataResidencies, isZeroDataRetentionAvailable } =
    useAvailableAiDataPolicyOptions();

  return isNonEmptyArray(dataResidencies) || isZeroDataRetentionAvailable;
};
