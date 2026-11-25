import { defineSettingsFrontComponent } from 'twenty-sdk/define';

import { WHATSAPP_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WhatsAppSettings } from 'src/front-components/components/WhatsAppSettings';

export default defineSettingsFrontComponent({
  universalIdentifier: WHATSAPP_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-settings',
  description: 'WhatsApp account health and the workspace members who receive WhatsApp notifications.',
  component: WhatsAppSettings,
});
