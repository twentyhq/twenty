import { useAiChatAssistantProfile } from '@/ai/hooks/useAiChatAssistantProfile';
import { useSettingsAiBehavior } from '@/settings/ai/hooks/useSettingsAiBehavior';
import { SettingsAiBehaviorSection } from '~/pages/settings/ai/components/SettingsAiBehaviorSection';

export const SettingsAiWorkspaceBehaviorSection = () => {
  const { displayName: assistantDisplayName } = useAiChatAssistantProfile();
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
      assistantDisplayName={assistantDisplayName}
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
