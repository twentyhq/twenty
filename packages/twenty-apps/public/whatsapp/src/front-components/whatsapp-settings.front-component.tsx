import { defineFrontComponent } from 'twenty-sdk/define';

import { WHATSAPP_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WhatsappSettings } from 'src/front-components/components/WhatsappSettings';

export default defineFrontComponent({
  universalIdentifier: WHATSAPP_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-settings',
  description:
    'WhatsApp import, visibility, contact auto-creation and read status of the member connection.',
  component: WhatsappSettings,
});
