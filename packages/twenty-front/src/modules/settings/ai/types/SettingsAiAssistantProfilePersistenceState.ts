import { type createSettingsAiAssistantProfileSaveQueue } from '@/settings/ai/utils/createSettingsAiAssistantProfileSaveQueue';

export type SettingsAiAssistantProfilePersistenceState = {
  saveQueue: ReturnType<typeof createSettingsAiAssistantProfileSaveQueue>;
  isSaving: boolean;
  errorMessage?: string;
  isRefreshing: boolean;
  hasRefreshError: boolean;
};
