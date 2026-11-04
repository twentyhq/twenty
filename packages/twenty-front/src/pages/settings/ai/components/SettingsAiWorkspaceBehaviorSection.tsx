import { useSettingsAiBehavior } from '@/settings/ai/hooks/useSettingsAiBehavior';
import { SettingsAiBehaviorSection } from '~/pages/settings/ai/components/SettingsAiBehaviorSection';

export const SettingsAiWorkspaceBehaviorSection = () => {
  const {
    inboxMode,
    isLoading,
    isSaving,
    isBehaviorVisible,
    errorMessage,
    saveInboxMode,
  } = useSettingsAiBehavior();

  if (!isBehaviorVisible) {
    return null;
  }

  return (
    <SettingsAiBehaviorSection
      inboxMode={inboxMode}
      onInboxModeChange={saveInboxMode}
      isLoading={isLoading}
      disabled={isSaving}
      errorMessage={errorMessage}
    />
  );
};
