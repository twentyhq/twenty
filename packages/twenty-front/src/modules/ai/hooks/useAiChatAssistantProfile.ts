import { type AiChatAssistantProfile } from 'twenty-shared/ai';

import { aiChatAssistantProfileSelector } from '@/ai/states/selectors/aiChatAssistantProfileSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatAssistantProfile = (): AiChatAssistantProfile =>
  useAtomStateValue(aiChatAssistantProfileSelector);
