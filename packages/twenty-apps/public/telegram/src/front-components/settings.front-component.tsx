import { defineSettingsFrontComponent } from 'twenty-sdk/define';

import { SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TelegramSettings } from 'src/front-components/components/TelegramSettings';

export default defineSettingsFrontComponent({
  universalIdentifier: SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'telegram-settings',
  description:
    'Connect your Telegram account and review the accounts connected in this workspace.',
  component: TelegramSettings,
});
