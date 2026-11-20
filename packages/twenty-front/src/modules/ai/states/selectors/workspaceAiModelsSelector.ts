import { isAiModelCompliantWithDataPolicy } from 'twenty-shared/ai';

import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const workspaceAiModelsSelector = createAtomSelector({
  key: 'workspaceAiModelsSelector',
  get: ({ get }) => {
    const aiDataPolicy = getWorkspaceAiDataPolicy(get(currentWorkspaceState));

    return get(aiModelsState).filter((model) =>
      isAiModelCompliantWithDataPolicy({ model, aiDataPolicy }),
    );
  },
});
