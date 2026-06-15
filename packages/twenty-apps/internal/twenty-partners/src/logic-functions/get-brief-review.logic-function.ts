import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

export const GET_BRIEF_REVIEW_LOGIC_FUNCTION_ID =
  '7c2a9e10-3b4d-4f81-9a2c-1e5d8b6f0a21';

const microsToUsd = (
  currency: { amountMicros?: number | null } | null | undefined,
): number | null =>
  currency && typeof currency.amountMicros === 'number'
    ? Math.round(currency.amountMicros / 1_000_000)
    : null;

// Profile-grade partner summary so the client can actually compare candidates.
// Enum arrays (region/languages/scope) are returned raw; the website humanizes
// them with its existing chip-label maps.
type Candidate = {
  applicationId: string;
  state: string;
  pitch: string | null;
  partner: {
    slug: string | null;
    name: string | null;
    introduction: string | null;
    country: string | null;
    city: string | null;
    region: string[] | null;
    languagesSpoken: string[] | null;
    skills: string[] | null;
    hourlyRateUsd: number | null;
    projectBudgetMinUsd: number | null;
    profilePictureUrl: string | null;
  } | null;
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

    // One partner query per application (v2.5.1 resolves a single hop only), but
    // they are independent, so fan them out concurrently instead of N sequential
    // round-trips. Promise.all preserves order, so candidates stay stable.
    const candidates: Candidate[] = await Promise.all(
      apps.map(async (app): Promise<Candidate> => {
        let partner: Candidate['partner'] = null;
        if (app.partnerId) {
          const pr = await client.query({
            partner: {
              __args: { filter: { id: { eq: app.partnerId } } },
              name: true,
              slug: true,
              introduction: true,
              country: true,
              city: true,
              region: true,
              languagesSpoken: true,
              skills: true,
              hourlyRate: { amountMicros: true },
              projectBudgetMin: { amountMicros: true },
              profilePicture: { primaryLinkUrl: true },
            },
          });
          partner = pr.partner
            ? {
                slug: pr.partner.slug ?? null,
                name: pr.partner.name ?? null,
                introduction: pr.partner.introduction ?? null,
                country: pr.partner.country ?? null,
                city: pr.partner.city ?? null,
                region: pr.partner.region ?? null,
                languagesSpoken: pr.partner.languagesSpoken ?? null,
                skills: pr.partner.skills ?? null,
                hourlyRateUsd: microsToUsd(pr.partner.hourlyRate),
                projectBudgetMinUsd: microsToUsd(pr.partner.projectBudgetMin),
                profilePictureUrl:
                  pr.partner.profilePicture?.primaryLinkUrl ?? null,
              }
            : null;
        }
        return {
          applicationId: app.id,
          state: app.state,
          pitch: app.pitch ?? null,
          partner,
        };
      }),
    );
    // At most one Application per Brief is INTRODUCED (enforced by submit-brief-pick).
    const picked = apps.find((app) => app.state === 'INTRODUCED')?.id ?? null;

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
    // Public unauthenticated endpoint: log the detail server-side, return a
    // generic reason so internals never leak to the client.
    console.error('get-brief-review failed', err);
    return { ok: false, reason: 'INTERNAL_ERROR' };
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
