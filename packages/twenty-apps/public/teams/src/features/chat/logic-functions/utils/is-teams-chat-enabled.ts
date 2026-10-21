import { RELEASE_FLAGS } from 'src/constants/release-flags';
import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

export const isTeamsChatEnabled = (): boolean =>
  isFeatureEnabled({
    isAvailable: RELEASE_FLAGS.IS_CHAT_ASSISTANT_RELEASED,
    settingValue: process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY],
  });
