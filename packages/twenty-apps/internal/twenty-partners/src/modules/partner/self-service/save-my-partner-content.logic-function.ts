import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import {
  saveMyPartnerContent,
  type SaveContentResult,
} from 'src/modules/partner/self-service/services/save-my-partner-content.service';

export const SAVE_MY_PARTNER_CONTENT_ID = 'e574fc61-6d9e-48db-9e98-a9b8160188cc';

export const handler = (event: RoutePayload<unknown>): Promise<SaveContentResult> =>
  saveMyPartnerContent(event);

export default defineLogicFunction({
  universalIdentifier: SAVE_MY_PARTNER_CONTENT_ID,
  name: 'save-my-partner-content',
  description:
    "Reconciles the calling partner's own case studies (create/update/delete in one call); each row is published (APPROVED) or kept as a draft (WIP) per its published flag.",
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/save-my-partner-content',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
