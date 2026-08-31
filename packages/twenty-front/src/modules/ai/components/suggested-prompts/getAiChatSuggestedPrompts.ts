import { isDefined } from 'twenty-shared/utils';

import {
  LIST_VIEW_SUGGESTED_PROMPTS,
  RECORD_PAGE_SUGGESTED_PROMPTS,
  RECORD_PAGE_SUGGESTED_PROMPTS_BY_OBJECT_NAME_SINGULAR,
} from '@/ai/components/suggested-prompts/contextual-suggested-prompts';
import { DEFAULT_SUGGESTED_PROMPTS } from '@/ai/components/suggested-prompts/default-suggested-prompts';
import { type AiChatSuggestedPromptsContext } from '@/ai/types/AiChatSuggestedPromptsContext';
import { type SuggestedPrompt } from '@/ai/types/SuggestedPrompt';

export const getAiChatSuggestedPrompts = (
  aiChatSuggestedPromptsContext: AiChatSuggestedPromptsContext | null,
): SuggestedPrompt[] => {
  if (!isDefined(aiChatSuggestedPromptsContext)) {
    return DEFAULT_SUGGESTED_PROMPTS;
  }

  const { browsingContextType, objectNameSingular } =
    aiChatSuggestedPromptsContext;

  if (browsingContextType === 'listView') {
    return LIST_VIEW_SUGGESTED_PROMPTS;
  }

  return (
    RECORD_PAGE_SUGGESTED_PROMPTS_BY_OBJECT_NAME_SINGULAR[objectNameSingular] ??
    RECORD_PAGE_SUGGESTED_PROMPTS
  );
};
