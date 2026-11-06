import { type SettingsAiAssistantProfilePersistenceState } from '@/settings/ai/types/SettingsAiAssistantProfilePersistenceState';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const settingsAiAssistantProfilePersistenceFamilyState =
  createAtomFamilyState<
    SettingsAiAssistantProfilePersistenceState | null,
    string | null
  >({
    key: 'settingsAiAssistantProfilePersistenceFamilyState',
    defaultValue: null,
  });
