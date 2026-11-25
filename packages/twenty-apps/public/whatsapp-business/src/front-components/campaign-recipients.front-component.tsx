import 'twenty-ui/style.css';
import 'twenty-ui/theme-dark.css';
import 'twenty-ui/theme-light.css';

import { defineFrontComponent } from 'twenty-sdk/define';

import { WHATSAPP_CAMPAIGN_RECIPIENTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CampaignRecipientsWidget } from 'src/front-components/components/CampaignRecipientsWidget';

export default defineFrontComponent({
  universalIdentifier: WHATSAPP_CAMPAIGN_RECIPIENTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-campaign-recipients',
  description: 'Lists the recipients of a WhatsApp campaign with their delivery status, failure reason and replies.',
  component: CampaignRecipientsWidget,
});
