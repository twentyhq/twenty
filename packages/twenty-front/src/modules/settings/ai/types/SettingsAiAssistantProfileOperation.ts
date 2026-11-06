import { type AiChatAssistantProfile } from 'twenty-shared/ai';

export type SettingsAiAssistantProfileOperation =
  | { type: 'update'; patch: Partial<AiChatAssistantProfile> }
  | { type: 'reset' };
