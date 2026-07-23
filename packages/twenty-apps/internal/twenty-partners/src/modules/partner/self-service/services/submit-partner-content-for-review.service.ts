import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type RoutePayload } from 'twenty-sdk/define';

import { updatePartnerContent } from 'src/modules/partner/self-service/graphql/mutations/update-partner-content';
import { findPartnerContentOwner } from 'src/modules/partner/self-service/graphql/queries/find-partner-content-owner';
import {
  canSubmitForReview,
  submitContentForReviewSchema,
} from 'src/modules/partner/self-service/mappers/submit-partner-content-for-review.mapper';
import {
  buildAppClient,
  errorResponse,
  failureResponse,
  resolvePartnerFromRequest,
} from 'src/modules/partner/self-service/services/resolve-partner-from-request.service';

export type SubmitContentForReviewResult =
  | { ok: true; status: 'UNDER_CUSTOMER_PARTNER_REVIEW' }
  | { ok: false; reason: string };

const queryContentOwnerAndStatus = async (
  client: CoreApiClient,
  recordId: string,
): Promise<{ partnerId: string | null; status: string | null } | null> => {
  const result = await findPartnerContentOwner(client, recordId);
  const node = result.partnerContents?.edges?.[0]?.node;
  if (!node) return null;
  return { partnerId: node.partnerId ?? null, status: node.status ?? null };
};

export const submitPartnerContentForReview = async (
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

    await updatePartnerContent(client, parsed.data.recordId, {
      status: 'UNDER_CUSTOMER_PARTNER_REVIEW',
    });

    return { ok: true, status: 'UNDER_CUSTOMER_PARTNER_REVIEW' };
  } catch (err) {
    return failureResponse('submit-partner-content-for-review', err);
  }
};
