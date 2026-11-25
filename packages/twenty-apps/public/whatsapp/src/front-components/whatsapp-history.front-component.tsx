import { defineFrontComponent } from 'twenty-sdk/define';

import { WHATSAPP_HISTORY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WhatsappHistory } from 'src/front-components/components/WhatsappHistory';

export default defineFrontComponent({
  universalIdentifier: WHATSAPP_HISTORY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-history',
  description:
    'Import of the past WhatsApp conversations of the member connection, with its progress.',
  component: WhatsappHistory,
});
