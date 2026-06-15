import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { firstFileUrl } from './profile-picture';

export const GET_PARTNER_BY_SLUG_LOGIC_FUNCTION_ID =
  '5e3e7b88-2cf2-4f56-9a4a-46c4c1d6b0bb';

type CurrencyValue = { amountMicros: number; currencyCode: string } | null;
type LinkValue = { primaryLinkUrl: string | null } | null;

type Partner = {
  id: string;
  name: string | null;
  slug: string | null;
  introduction: string | null;
  languagesSpoken: string[] | null;
  deploymentExpertise: string[] | null;
  partnerScope: string[] | null;
  region: string[] | null;
  calendarLink: LinkValue;
  hourlyRate: CurrencyValue;
  projectBudgetMin: CurrencyValue;
  linkedin: LinkValue;
  profilePicture: LinkValue;
  skills: string[] | null;
  city: string | null;
  country: string | null;
};

type GetPartnerBySlugResult =
  | { ok: true; partner: Partner }
  | { ok: false; reason: 'NOT_FOUND' | string };

const handler = async (input: {
  queryStringParameters?: { slug?: string };
}): Promise<GetPartnerBySlugResult> => {
  const slug = input?.queryStringParameters?.slug;
  if (typeof slug !== 'string' || slug.length === 0) {
    return { ok: false, reason: 'Missing slug query parameter' };
  }

  try {
    const client = new CoreApiClient();

    const result = await client.query({
      partners: {
        __args: {
          filter: {
            slug: { eq: slug },
            validationStage: { eq: 'VALIDATED' },
            availability: { eq: 'AVAILABLE' },
          },
          first: 1,
        },
        edges: {
          node: {
            id: true,
            name: true,
            slug: true,
            introduction: true,
            languagesSpoken: true,
            deploymentExpertise: true,
            partnerScope: true,
            region: true,
            calendarLink: { primaryLinkUrl: true },
            hourlyRate: { amountMicros: true, currencyCode: true },
            projectBudgetMin: { amountMicros: true, currencyCode: true },
            linkedin: { primaryLinkUrl: true },
            profilePicture: { url: true },
            skills: true,
            city: true,
            country: true,
          },
        },
      },
    } as any);

    const rawEdges = (result?.partners?.edges ?? []) as Array<{
      node: Omit<Partner, 'profilePicture'> & {
        profilePicture: ReadonlyArray<{ url?: string | null }> | null;
      };
    }>;
    const rawNode = rawEdges[0]?.node;

    if (!rawNode) {
      return { ok: false, reason: 'NOT_FOUND' };
    }

    const partner: Partner = {
      ...rawNode,
      profilePicture: { primaryLinkUrl: firstFileUrl(rawNode.profilePicture) },
    };

    return { ok: true, partner };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: GET_PARTNER_BY_SLUG_LOGIC_FUNCTION_ID,
  name: 'get-partner-by-slug',
  description:
    'Returns a single VALIDATED + AVAILABLE partner by slug, or NOT_FOUND.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/partner-by-slug',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
