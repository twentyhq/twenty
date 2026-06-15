import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

export const GET_BRIEF_REVIEW_LOGIC_FUNCTION_ID =
  '7c2a9e10-3b4d-4f81-9a2c-1e5d8b6f0a21';

type Candidate = {
  applicationId: string;
  state: string;
  pitch: string | null;
  partner: { name: string | null; skills: string[] | null; country: string | null } | null;
};

type Result =
  | {
      ok: true;
      brief: { name: string | null; need: string | null; requirements: string | null; status: string };
      candidates: Candidate[];
      picked: string | null;
    }
  | { ok: false; reason: 'NOT_FOUND' | string };

export const handler = async (input: {
  queryStringParameters?: { token?: string };
}): Promise<Result> => {
  const token = input?.queryStringParameters?.token;
  if (typeof token !== 'string' || token.length === 0) {
    return { ok: false, reason: 'Missing token query parameter' };
  }

  try {
    const client = new CoreApiClient();

    const briefRes = await client.query({
      briefs: {
        __args: { filter: { reviewToken: { eq: token } }, first: 1 },
        edges: { node: { id: true, name: true, need: true, requirements: true, status: true } },
      },
    });
    const brief = briefRes.briefs?.edges?.[0]?.node;
    if (!brief) return { ok: false, reason: 'NOT_FOUND' };

    const appsRes = await client.query({
      applications: {
        __args: { filter: { briefId: { eq: brief.id } } },
        edges: { node: { id: true, state: true, pitch: true, partnerId: true } },
      },
    });
    const apps = (appsRes.applications?.edges ?? []).map((e) => e.node);

    const candidates: Candidate[] = [];
    let picked: string | null = null;
    for (const app of apps) {
      let partner: Candidate['partner'] = null;
      if (app.partnerId) {
        const pr = await client.query({
          partner: {
            __args: { filter: { id: { eq: app.partnerId } } },
            name: true,
            skills: true,
            country: true,
          },
        });
        partner = pr.partner
          ? {
              name: pr.partner.name ?? null,
              skills: pr.partner.skills ?? null,
              country: pr.partner.country ?? null,
            }
          : null;
      }
      // At most one Application per Brief is INTRODUCED (enforced by submit-brief-pick).
      if (app.state === 'INTRODUCED') picked = app.id;
      candidates.push({
        applicationId: app.id,
        state: app.state,
        pitch: app.pitch ?? null,
        partner,
      });
    }

    return {
      ok: true,
      brief: {
        name: brief.name ?? null,
        need: brief.need ?? null,
        requirements: brief.requirements ?? null,
        status: brief.status,
      },
      candidates,
      picked,
    };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
};

export default defineLogicFunction({
  universalIdentifier: GET_BRIEF_REVIEW_LOGIC_FUNCTION_ID,
  name: 'get-brief-review',
  description:
    'Public: returns a Brief + its candidate Applications by reviewToken, or NOT_FOUND.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/brief-review',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
