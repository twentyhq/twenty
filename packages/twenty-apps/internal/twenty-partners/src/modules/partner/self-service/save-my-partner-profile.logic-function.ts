import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import {
  saveMyPartnerProfile,
  type SaveResult,
} from 'src/modules/partner/self-service/services/save-my-partner-profile.service';

export const SAVE_MY_PARTNER_PROFILE_ID = 'de21e2a6-f4b4-4186-90d9-645015e856a1';

export const handler = (event: RoutePayload<unknown>): Promise<SaveResult> =>
  saveMyPartnerProfile(event);

export default defineLogicFunction({
  universalIdentifier: SAVE_MY_PARTNER_PROFILE_ID,
  name: 'save-my-partner-profile',
  description: "Saves the calling partner's own editable profile fields.",
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/save-my-partner-profile',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
