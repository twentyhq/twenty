import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import {
  getMyPartnerProfile,
  type MyPartnerProfileResult,
} from 'src/modules/partner/self-service/services/get-my-partner-profile.service';

export const GET_MY_PARTNER_PROFILE_ID = 'eacfd95b-de02-4f03-aa38-3cae31bb30a9';

export const handler = (event: RoutePayload<unknown>): Promise<MyPartnerProfileResult> =>
  getMyPartnerProfile(event);

export default defineLogicFunction({
  universalIdentifier: GET_MY_PARTNER_PROFILE_ID,
  name: 'get-my-partner-profile',
  description:
    "Returns the calling partner's own profile + links + services + case studies + enum options.",
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/my-partner-profile',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
