import { isAiModelTier, type AiModelTier } from 'twenty-shared/ai';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatUserSelectedModelTierState =
  createAtomState<AiModelTier | null>({
    key: 'ai/agentChatUserSelectedModelTier',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: isAiModelTier,
  });
