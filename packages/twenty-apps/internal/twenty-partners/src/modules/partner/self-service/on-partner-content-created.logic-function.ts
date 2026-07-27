import { defineLogicFunction } from 'twenty-sdk/define';

import { ON_PARTNER_CONTENT_CREATED_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { onPartnerContentCreated } from 'src/modules/partner/self-service/services/on-partner-content-created.service';

export const handler = onPartnerContentCreated;

export default defineLogicFunction({
  universalIdentifier: ON_PARTNER_CONTENT_CREATED_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-partner-content-created',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: { eventName: 'partnerContent.created' },
});
