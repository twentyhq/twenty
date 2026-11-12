import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { getAvailableAiDataPolicyOptions } from '@/settings/privacy/utils/getAvailableAiDataPolicyOptions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAvailableAiDataPolicyOptions = () => {
  const aiModels = useAtomStateValue(aiModelsState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return getAvailableAiDataPolicyOptions({
    aiModels,
    aiDataPolicy: getWorkspaceAiDataPolicy(currentWorkspace),
  });
};
