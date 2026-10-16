import { aiModelsState } from '@/client-config/states/aiModelsState';
import { getAvailableAiDataPolicyOptions } from '@/settings/privacy/utils/getAvailableAiDataPolicyOptions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// most self-hosted catalogs state no residency or retention, so there is nothing to choose from
export const useIsAiDataPolicyConfigurable = () => {
  const aiModels = useAtomStateValue(aiModelsState);
  const { aiDataResidencies, isZeroDataRetentionAvailable } =
    getAvailableAiDataPolicyOptions(aiModels);

  return aiDataResidencies.length > 0 || isZeroDataRetentionAvailable;
};
