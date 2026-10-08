import { type BrowsingContext } from '@/ai/types/BrowsingContext';

export type AiChatSuggestedPromptsContext = {
  browsingContextType: BrowsingContext['type'];
  objectNameSingular: string;
};
