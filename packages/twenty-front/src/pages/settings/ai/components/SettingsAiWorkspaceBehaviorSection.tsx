import { useSettingsAiBehavior } from '@/settings/ai/hooks/useSettingsAiBehavior';
import { SettingsAiBehaviorSection } from '~/pages/settings/ai/components/SettingsAiBehaviorSection';

export const SettingsAiWorkspaceBehaviorSection = () => {
  const {
    directMessageMode,
    inboxMode,
    isLoading,
    isSaving,
    isBehaviorVisible,
    errorMessage,
    saveDirectMessageMode,
    saveInboxMode,
  } = useSettingsAiBehavior();

  if (!isBehaviorVisible) {
    return null;
  }

  return (
    <SettingsAiBehaviorSection
      directMessageMode={directMessageMode}
      inboxMode={inboxMode}
      onDirectMessageModeChange={saveDirectMessageMode}
      onInboxModeChange={saveInboxMode}
      isLoading={isLoading}
      disabled={isSaving}
      errorMessage={errorMessage}
    />
  );
};
