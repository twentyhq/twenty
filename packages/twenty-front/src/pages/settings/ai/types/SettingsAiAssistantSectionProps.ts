import { type AiChatAssistantProfile } from 'twenty-shared/ai';

export type SettingsAiAssistantSectionProps = {
  value: AiChatAssistantProfile;
  onChange: (value: Partial<AiChatAssistantProfile>) => void;
  disabled?: boolean;
  isSaving?: boolean;
  errorMessage?: string;
};
