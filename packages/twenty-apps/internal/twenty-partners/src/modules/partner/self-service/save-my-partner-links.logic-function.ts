import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import {
  saveMyPartnerLinks,
  type SaveLinksResult,
} from 'src/modules/partner/self-service/services/save-my-partner-links.service';

export const SAVE_MY_PARTNER_LINKS_ID = 'b56d1158-4e79-4fdb-a7c4-e0f8871b2d42';

export const handler = (event: RoutePayload<unknown>): Promise<SaveLinksResult> =>
  saveMyPartnerLinks(event);

export default defineLogicFunction({
  universalIdentifier: SAVE_MY_PARTNER_LINKS_ID,
  name: 'save-my-partner-links',
  description: "Reconciles the calling partner's own links (create/update/delete in one call).",
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/save-my-partner-links',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
