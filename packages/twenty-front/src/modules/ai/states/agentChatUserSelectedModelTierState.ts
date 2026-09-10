import { isAiModelTier, type AiModelTier } from 'twenty-shared/ai';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// null follows the workspace chat tier.
export const agentChatUserSelectedModelTierState =
  createAtomState<AiModelTier | null>({
    key: 'ai/agentChatUserSelectedModelTier',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    // A stale tier name in localStorage hydrates as null instead.
    validateInitFn: isAiModelTier,
  });
