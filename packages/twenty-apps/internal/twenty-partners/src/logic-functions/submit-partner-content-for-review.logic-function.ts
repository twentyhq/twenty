import { type CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { z } from 'zod';

import { buildAppClient, errorResponse, failureResponse, resolvePartnerFromRequest } from './resolve-partner-from-request';

export const SUBMIT_PARTNER_CONTENT_FOR_REVIEW_ID = '6d722484-bbe9-4ffc-b017-5164e3a5a03c';

export const submitContentForReviewSchema = z.object({
  recordId: z.string(),
});

export type SubmitContentForReviewInput = z.infer<typeof submitContentForReviewSchema>;

export type SubmitContentForReviewResult =
  | { ok: true; status: 'UNDER_CUSTOMER_PARTNER_REVIEW' }
  | { ok: false; reason: string };

// Only a WIP row can be submitted — this is the one status transition a partner
// can trigger themselves; every other transition stays staff-controlled.
export function canSubmitForReview(status: string | null): boolean {
  return status === 'WIP';
}

const queryContentOwnerAndStatus = async (
  client: CoreApiClient,
  recordId: string,
): Promise<{ partnerId: string | null; status: string | null } | null> => {
  const result = await client.query({
    partnerContents: {
      __args: { filter: { id: { eq: recordId } }, first: 1 },
      edges: { node: { partnerId: true, status: true } },
    },
  });
  const node = result.partnerContents?.edges?.[0]?.node;
  if (!node) return null;
  return { partnerId: node.partnerId ?? null, status: node.status ?? null };
};

export const handler = async (
  event: RoutePayload<unknown>,
): Promise<SubmitContentForReviewResult> => {
  const resolved = await resolvePartnerFromRequest(event);
  if ('error' in resolved) return errorResponse(resolved.error);

  const parsed = submitContentForReviewSchema.safeParse(event.body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'invalid_input');
  }

  try {
    const client = buildAppClient();
    const content = await queryContentOwnerAndStatus(client, parsed.data.recordId);

    if (!content || content.partnerId !== resolved.partnerId) {
      return errorResponse('FORBIDDEN');
    }
    if (!canSubmitForReview(content.status)) {
      return errorResponse('NOT_SUBMITTABLE');
    }

    await client.mutation({
      updatePartnerContent: {
        __args: {
          id: parsed.data.recordId,
          data: { status: 'UNDER_CUSTOMER_PARTNER_REVIEW' },
        },
        id: true,
      },
    });

    return { ok: true, status: 'UNDER_CUSTOMER_PARTNER_REVIEW' };
  } catch (err) {
    return failureResponse('submit-partner-content-for-review', err);
  }
};

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
