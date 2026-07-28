import { defineLogicFunction } from 'twenty-sdk/define';

import { ON_PARTNER_SERVICE_CREATED_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { onPartnerServiceCreated } from 'src/modules/partner/self-service/services/on-partner-service-created.service';

export const handler = onPartnerServiceCreated;

export default defineLogicFunction({
  universalIdentifier: ON_PARTNER_SERVICE_CREATED_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-partner-service-created',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: { eventName: 'partnerService.created' },
});
