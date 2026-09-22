import { useTranslate } from 'twenty-sdk/front-component';

import { FEATURE_FLAGS } from 'src/feature-flags/feature-flags';
import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { isChatEnabled } from 'src/features/chat/utils/is-chat-enabled';
import { FeatureSettingsSection } from 'src/front-components/components/FeatureSettingsSection';
import { useFeatureSetting } from 'src/front-components/hooks/use-feature-setting';

export const ChatSettings = () => {
  const { t } = useTranslate();
  const { settingValue, isSaving, hasSaveError, updateSetting } =
    useFeatureSetting({
      variableKey: CHAT_ENABLED_APPLICATION_VARIABLE_KEY,
      isAvailable: FEATURE_FLAGS.IS_CHAT_ASSISTANT_ENABLED,
    });

  const handleChange = (isEnabled: boolean) => {
    void updateSetting(isEnabled);
  };

  return (
    <FeatureSettingsSection
      title={t('Chat')}
      label={t('Enable chat')}
      description={t(
        'Use the Teams assistant and messaging workflows in this workspace.',
      )}
      isAvailable={FEATURE_FLAGS.IS_CHAT_ASSISTANT_ENABLED}
      isEnabled={isChatEnabled(settingValue)}
      isSaving={isSaving}
      hasSaveError={hasSaveError}
      onChange={handleChange}
    />
  );
};
