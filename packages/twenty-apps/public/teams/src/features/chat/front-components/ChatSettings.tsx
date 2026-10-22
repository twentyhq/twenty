import { useTranslate } from 'twenty-sdk/front-component';

import { RELEASE_FLAGS } from 'src/constants/release-flags';
import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { TeamsUserLinksList } from 'src/features/chat/front-components/TeamsUserLinksList';
import { FeatureSettingsSection } from 'src/front-components/components/FeatureSettingsSection';
import { useFeatureSetting } from 'src/front-components/hooks/use-feature-setting';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

export const ChatSettings = () => {
  const { t } = useTranslate();
  const { settingValue, isSaving, hasSaveError, updateSetting } =
    useFeatureSetting({
      variableKey: CHAT_ENABLED_APPLICATION_VARIABLE_KEY,
      isAvailable: RELEASE_FLAGS.IS_CHAT_ASSISTANT_RELEASED,
    });

  const isChatEnabled = isFeatureEnabled({
    isAvailable: RELEASE_FLAGS.IS_CHAT_ASSISTANT_RELEASED,
    settingValue,
  });

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
        isAvailable={RELEASE_FLAGS.IS_CHAT_ASSISTANT_RELEASED}
        isEnabled={isChatEnabled}
        isSaving={isSaving}
        hasSaveError={hasSaveError}
        onChange={handleChange}
      />
      {isChatEnabled && <TeamsUserLinksList />}
    </>
  );
};
