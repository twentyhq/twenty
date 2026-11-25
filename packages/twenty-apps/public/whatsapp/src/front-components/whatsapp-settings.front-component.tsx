import { defineFrontComponent } from 'twenty-sdk/define';

import { WHATSAPP_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WhatsappSettings } from 'src/front-components/components/WhatsappSettings';

export default defineFrontComponent({
  universalIdentifier: WHATSAPP_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-settings',
  description:
    'Sync and History tabs of the member connection: WhatsApp import, visibility, contact auto-creation, read status and the import of past conversations.',
  component: WhatsappSettings,
});
