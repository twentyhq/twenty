import { FEATURE_FLAGS } from 'src/feature-flags/feature-flags';

export const isChatEnabled = (settingValue: string | undefined): boolean =>
  FEATURE_FLAGS.IS_CHAT_ASSISTANT_ENABLED && settingValue === 'true';
