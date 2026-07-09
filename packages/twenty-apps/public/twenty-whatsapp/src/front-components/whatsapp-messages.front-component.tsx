import { defineFrontComponent } from 'twenty-sdk/define';

import 'twenty-ui/style.css';

import { WHATSAPP_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { WhatsappMessages } from 'src/front-components/components/WhatsappMessages';

export default defineFrontComponent({
  universalIdentifier:
    WHATSAPP_UNIVERSAL_IDENTIFIERS.whatsappMessagesFrontComponent,
  name: 'whatsapp-messages',
  description:
    'WhatsApp conversation viewer for person and company record pages.',
  component: WhatsappMessages,
});
