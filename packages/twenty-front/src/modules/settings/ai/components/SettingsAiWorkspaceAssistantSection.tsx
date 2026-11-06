import { SettingsAiAssistantProfileSyncEffect } from '@/settings/ai/components/SettingsAiAssistantProfileSyncEffect';
import { useSettingsAiAssistantProfile } from '@/settings/ai/hooks/useSettingsAiAssistantProfile';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { SettingsAiAssistantSection } from '~/pages/settings/ai/components/SettingsAiAssistantSection';

export const SettingsAiWorkspaceAssistantSection = () => {
  const { t } = useLingui();
  const {
    profile,
    workspace,
    workspaceId,
    isVisible,
    isLoading,
    hasLoadError,
    isSaving,
    errorMessage,
    saveProfile,
    reset,
    retry,
  } = useSettingsAiAssistantProfile();

  if (!isVisible) {
    return null;
  }

  if (isLoading) {
    return (
      <Section.Root aria-busy>
        <Section.Header title={t`Avatar`} />
        <Text role="status">{t`Loading assistant settings...`}</Text>
      </Section.Root>
    );
  }

  if (hasLoadError || !isDefined(profile) || !isDefined(workspace)) {
    return (
      <Section.Root>
        <Section.Header title={t`Avatar`} />
        <InlineBanner
          role="alert"
          status="error"
          icon={<IconAlertTriangle aria-hidden />}
          embedded
          action={
            <InlineBanner.Action
              onClick={retry}
            >{t`Retry`}</InlineBanner.Action>
          }
        >
          {t`Failed to load assistant settings. Try again.`}
        </InlineBanner>
      </Section.Root>
    );
  }

  return (
    <>
      <SettingsAiAssistantProfileSyncEffect workspace={workspace} />
      <SettingsAiAssistantSection
        key={workspaceId}
        value={profile}
        onChange={saveProfile}
        onReset={reset}
        onRetry={retry}
        isSaving={isSaving}
        errorMessage={errorMessage}
      />
    </>
  );
};
