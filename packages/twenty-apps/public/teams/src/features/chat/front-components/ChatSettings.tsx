import { useState } from 'react';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';

import { RELEASE_FLAGS } from 'src/constants/release-flags';
import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { TeamsUserLinksSettings } from 'src/features/chat/front-components/TeamsUserLinksSettings';
import { reconcileTeamsChat } from 'src/features/chat/front-components/utils/reconcile-teams-chat';
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

  const [isUpdating, setIsUpdating] = useState(false);

  const isChatEnabled = isFeatureEnabled({
    isAvailable: RELEASE_FLAGS.IS_CHAT_ASSISTANT_RELEASED,
    settingValue,
  });

  const updateChat = async (isEnabled: boolean) => {
    if (!(await updateSetting(isEnabled))) {
      return;
    }

    const result = await reconcileTeamsChat(isEnabled);
    const connections = result?.success === true ? result.connections : [];

    if (connections.some((connection) => connection.status === 'CONFLICT')) {
      enqueueSnackbar({
        message: t(
          'Another workspace already uses chat for this Microsoft organization.',
        ),
        variant: 'error',
      });

      return;
    }

    if (
      result?.success !== true ||
      connections.some((connection) => connection.status === 'FAILED')
    ) {
      enqueueSnackbar({
        message: t(
          'Setting saved, but Teams chat was not updated. Turn it off and on again.',
        ),
        variant: 'error',
      });
    }
  };

  // One flag spans the save and the Teams update, so the switch never re-enables between them.
  const handleChange = async (isEnabled: boolean) => {
    if (isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      await updateChat(isEnabled);
    } finally {
      setIsUpdating(false);
    }
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
        isSaving={isSaving || isUpdating}
        hasSaveError={hasSaveError}
        onChange={handleChange}
      />
      {isChatEnabled && <TeamsUserLinksSettings />}
    </>
  );
};
