import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import {
  submitPartnerContentForReview,
  type SubmitContentForReviewResult,
} from 'src/modules/partner/self-service/services/submit-partner-content-for-review.service';

export const SUBMIT_PARTNER_CONTENT_FOR_REVIEW_ID = '6d722484-bbe9-4ffc-b017-5164e3a5a03c';

export const handler = (
  event: RoutePayload<unknown>,
): Promise<SubmitContentForReviewResult> => submitPartnerContentForReview(event);

export default defineLogicFunction({
  universalIdentifier: SUBMIT_PARTNER_CONTENT_FOR_REVIEW_ID,
  name: 'submit-partner-content-for-review',
  description:
    "Flips the calling partner's own WIP case study/content to under-review.",
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/submit-partner-content-for-review',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
