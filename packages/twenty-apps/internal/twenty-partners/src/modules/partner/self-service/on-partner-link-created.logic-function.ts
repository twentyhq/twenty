import { defineLogicFunction } from 'twenty-sdk/define';

import { ON_PARTNER_LINK_CREATED_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { onPartnerLinkCreated } from 'src/modules/partner/self-service/services/on-partner-link-created.service';

export const handler = onPartnerLinkCreated;

export default defineLogicFunction({
  universalIdentifier: ON_PARTNER_LINK_CREATED_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-partner-link-created',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: { eventName: 'partnerLink.created' },
});
