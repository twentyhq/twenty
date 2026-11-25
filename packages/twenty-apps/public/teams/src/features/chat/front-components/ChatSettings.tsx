import { useTranslate } from 'twenty-sdk/front-component';

import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { TeamsUserLinksSettings } from 'src/features/chat/front-components/TeamsUserLinksSettings';
import { FeatureSettingsSection } from 'src/front-components/components/FeatureSettingsSection';
import { useFeatureSetting } from 'src/front-components/hooks/use-feature-setting';

export const ChatSettings = () => {
  const { t } = useTranslate();
  const { settingValue, isSaving, hasSaveError, updateSetting } =
    useFeatureSetting({
      variableKey: CHAT_ENABLED_APPLICATION_VARIABLE_KEY,
    });

  const isChatEnabled = settingValue === 'true';

  const handleChange = (isEnabled: boolean) => {
    void updateSetting(isEnabled);
  };

  return (
    <>
      <FeatureSettingsSection
        title={t('Chat')}
        label={t('Enable chat')}
        description={t(
          'Use the Teams assistant and messaging workflows in this workspace.',
        )}
        isEnabled={isChatEnabled}
        isSaving={isSaving}
        hasSaveError={hasSaveError}
        onChange={handleChange}
      />
      {isChatEnabled && <TeamsUserLinksSettings />}
    </>
  );
};
