import { defineLogicFunction } from 'twenty-sdk/define';

import { getPartnerBySlug } from 'src/modules/partner/marketplace/services/get-partner-by-slug.service';

export const GET_PARTNER_BY_SLUG_LOGIC_FUNCTION_ID =
  '5e3e7b88-2cf2-4f56-9a4a-46c4c1d6b0bb';

export const handler = getPartnerBySlug;

export default defineLogicFunction({
  universalIdentifier: GET_PARTNER_BY_SLUG_LOGIC_FUNCTION_ID,
  name: 'get-partner-by-slug',
  description:
    'Returns a single VALIDATED + AVAILABLE partner by slug, or NOT_FOUND.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/partner-by-slug',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
