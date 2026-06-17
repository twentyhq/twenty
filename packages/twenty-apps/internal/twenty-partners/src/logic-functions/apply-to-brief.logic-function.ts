import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { z } from 'zod';

export const APPLY_TO_BRIEF_LOGIC_FUNCTION_ID =
  '4ca35460-a627-42f8-b016-a0860efa3de9';

const APPLICATION_SECRET_HEADER = 'x-application-secret';

export const applyToBriefSchema = z.object({
  opportunityId: z.string().trim().min(1),
  applicantMemberId: z.string().trim().min(1),
  pitch: z.string().optional(),
});

type ApplyToBriefEvent = {
  headers?: Record<string, string | undefined>;
  body?: unknown;
};

// Called server-to-server by the "Apply" workflow's CODE step (manual trigger on Opportunity).
// The workflow passes the triggering partner's member id (run.createdBy.workspaceMemberId) as
// applicantMemberId. Secret-guarded like submit-partner-application (isAuthRequired:false).
export const handler = async (
  event: ApplyToBriefEvent | z.input<typeof applyToBriefSchema>,
): Promise<Record<string, unknown>> => {
  const looksLikeEvent =
    typeof event === 'object' &&
    event !== null &&
    ('body' in event || 'headers' in event);
  const headers = looksLikeEvent
    ? (event as ApplyToBriefEvent).headers ?? {}
    : {};
  const rawBody = looksLikeEvent ? (event as ApplyToBriefEvent).body : event;

  const expectedSecret = process.env.PARTNER_APPLICATION_SECRET;
  if (!expectedSecret) return { ok: false, reason: 'SECRET_NOT_CONFIGURED' };
  if (headers[APPLICATION_SECRET_HEADER] !== expectedSecret) {
    return { ok: false, reason: 'UNAUTHORIZED' };
  }

  const parsed = applyToBriefSchema.safeParse(
    typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody,
  );
  if (!parsed.success) return { ok: false, reason: 'INVALID_BODY' };
  const { opportunityId, applicantMemberId, pitch } = parsed.data;

  const client = new CoreApiClient();

  // member → Partner (partnerUser is the RLS pivot relation on Partner).
  const partnerRes = await client.query({
    partners: {
      __args: { filter: { partnerUserId: { eq: applicantMemberId } }, first: 1 },
      edges: { node: { id: true, name: true } },
    },
  });
  const partner = partnerRes.partners?.edges?.[0]?.node;
  if (!partner?.id) return { ok: false, reason: 'NOT_A_PARTNER' };

  // Idempotent on (opportunity, partner): a repeat apply is a no-op.
  const existing = await client.query({
    applications: {
      __args: {
        filter: { opportunityId: { eq: opportunityId }, partnerId: { eq: partner.id } },
        first: 1,
      },
      edges: { node: { id: true } },
    },
  });
  const existingId = existing.applications?.edges?.[0]?.node?.id;
  if (existingId) return { ok: true, already: true, applicationId: existingId };

  // Label here: the B3 auto-label handler only fires on application.updated.
  const oppRes = await client.query({
    opportunity: { __args: { filter: { id: { eq: opportunityId } } }, id: true, name: true },
  });
  const name = `${partner.name ?? 'Unassigned'} · ${oppRes.opportunity?.name ?? 'No brief'}`;
  const now = new Date().toISOString();

  const created = await client.mutation({
    createApplication: {
      __args: {
        data: {
          name,
          opportunityId,
          partnerId: partner.id,
          partnerUserId: applicantMemberId,
          state: 'APPLIED',
          lastActivityAt: now,
          ...(pitch ? { pitch } : {}),
        },
      },
      id: true,
    },
  });
  return { ok: true, applicationId: created.createApplication?.id };
};

export default defineLogicFunction({
  universalIdentifier: APPLY_TO_BRIEF_LOGIC_FUNCTION_ID,
  name: 'apply-to-brief',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/apply-to-brief',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [APPLICATION_SECRET_HEADER],
  },
});
