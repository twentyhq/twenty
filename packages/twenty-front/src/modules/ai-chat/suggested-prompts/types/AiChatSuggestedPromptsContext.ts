import { type BrowsingContext } from '@/ai-chat/types/BrowsingContext';

export type AiChatSuggestedPromptsContext = {
  browsingContextType: BrowsingContext['type'];
  objectNameSingular: string;
};
