import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { z } from 'zod';

export const SUBMIT_BRIEF_PICK_LOGIC_FUNCTION_ID =
  '4f9b1d62-8c07-4a35-b6e1-2d3a7c9f0b54';

const APPLICATION_SECRET_HEADER = 'x-application-secret';

export const submitBriefPickSchema = z.object({
  token: z.string().trim().min(1),
  applicationId: z.string().trim().min(1),
});
type SubmitBriefPickInput = z.infer<typeof submitBriefPickSchema>;
type SubmitBriefPickEvent = { headers?: Record<string, string | undefined>; body?: unknown };
type Result = { ok: true; picked: string } | { ok: false; reason: string };

export const handler = async (
  event: SubmitBriefPickEvent | SubmitBriefPickInput,
): Promise<Result> => {
  const looksLikeEvent =
    typeof event === 'object' && event !== null && ('body' in event || 'headers' in event);
  const headers = looksLikeEvent ? (event as SubmitBriefPickEvent).headers ?? {} : {};
  const rawInput = looksLikeEvent ? (event as SubmitBriefPickEvent).body : event;

  const expectedSecret = process.env.PARTNER_APPLICATION_SECRET;
  if (typeof expectedSecret !== 'string' || expectedSecret.length === 0) {
    return { ok: false, reason: 'unauthorized' };
  }
  if (headers[APPLICATION_SECRET_HEADER] !== expectedSecret) {
    return { ok: false, reason: 'unauthorized' };
  }

  const parsed = submitBriefPickSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, reason: 'invalid_input' };
  const { token, applicationId } = parsed.data;

  try {
    const client = new CoreApiClient();

    const briefRes = await client.query({
      briefs: {
        __args: { filter: { reviewToken: { eq: token } }, first: 1 },
        edges: { node: { id: true, status: true } },
      },
    });
    const brief = briefRes.briefs?.edges?.[0]?.node;
    if (!brief) return { ok: false, reason: 'NOT_FOUND' };
    if (brief.status === 'CLOSED') return { ok: false, reason: 'CLOSED' };

    const appsRes = await client.query({
      applications: {
        __args: { filter: { briefId: { eq: brief.id } } },
        edges: { node: { id: true, state: true } },
      },
    });
    const apps = (appsRes.applications?.edges ?? []).map((e) => e.node);
    const target = apps.find((a) => a.id === applicationId);
    if (!target) return { ok: false, reason: 'FORBIDDEN' };
    // Idempotent: a repeated pick of the already-chosen Application is a no-op,
    // so retries don't overwrite selectedAt or re-shuffle the others.
    if (target.state === 'INTRODUCED') return { ok: true, picked: applicationId };

    const now = new Date().toISOString();
    for (const app of apps) {
      if (app.id === applicationId) {
        await client.mutation({
          updateApplication: {
            __args: { id: app.id, data: { state: 'INTRODUCED', selectedAt: now } },
            id: true,
          },
        });
      } else if (app.state !== 'DECLINED' && app.state !== 'BACKUP') {
        await client.mutation({
          updateApplication: { __args: { id: app.id, data: { state: 'BACKUP' } }, id: true },
        });
      }
    }

    return { ok: true, picked: applicationId };
  } catch (err) {
    // Public endpoint: log server-side, return a generic reason (no internals).
    console.error('submit-brief-pick failed', err);
    return { ok: false, reason: 'internal_error' };
  }
};

export default defineLogicFunction({
  universalIdentifier: SUBMIT_BRIEF_PICK_LOGIC_FUNCTION_ID,
  name: 'submit-brief-pick',
  description:
    'Public (secret-guarded): records a client pick — chosen Application INTRODUCED+selectedAt, others BACKUP.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/brief-review/pick',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [APPLICATION_SECRET_HEADER],
  },
});
