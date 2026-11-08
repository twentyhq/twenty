import { useSettingsAiAssistantProfile } from '@/settings/ai/hooks/useSettingsAiAssistantProfile';
import { isDefined } from 'twenty-shared/utils';
import { SettingsAiAssistantSection } from '~/pages/settings/ai/components/SettingsAiAssistantSection';

export const SettingsAiWorkspaceAssistantSection = () => {
  const { profile, isSaving, errorMessage, saveProfile } =
    useSettingsAiAssistantProfile();

  if (!isDefined(profile)) {
    return null;
  }

  return (
    <SettingsAiAssistantSection
      value={profile}
      onChange={saveProfile}
      isSaving={isSaving}
      errorMessage={errorMessage}
    />
  );
};
