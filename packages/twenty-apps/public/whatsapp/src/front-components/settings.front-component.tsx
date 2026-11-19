import { defineSettingsFrontComponent } from 'twenty-sdk/define';

import { WHATSAPP_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { NotificationRecipientsSettings } from 'src/front-components/components/NotificationRecipientsSettings';

export default defineSettingsFrontComponent({
  universalIdentifier: WHATSAPP_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-settings',
  description: 'Choose which workspace members receive WhatsApp notifications.',
  component: NotificationRecipientsSettings,
});
