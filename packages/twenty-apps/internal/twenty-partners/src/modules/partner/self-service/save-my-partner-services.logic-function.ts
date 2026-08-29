import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import {
  saveMyPartnerServices,
  type SaveServicesResult,
} from 'src/modules/partner/self-service/services/save-my-partner-services.service';

export const SAVE_MY_PARTNER_SERVICES_ID = '878a6e36-62f4-4590-807d-ef6204d2d168';

export const handler = (event: RoutePayload<unknown>): Promise<SaveServicesResult> =>
  saveMyPartnerServices(event);

export default defineLogicFunction({
  universalIdentifier: SAVE_MY_PARTNER_SERVICES_ID,
  name: 'save-my-partner-services',
  description:
    "Reconciles the calling partner's own services (create/update/delete in one call).",
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/save-my-partner-services',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
