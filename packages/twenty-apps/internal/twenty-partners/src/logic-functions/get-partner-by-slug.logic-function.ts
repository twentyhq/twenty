import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { resolvePartnerPictureUrl } from './profile-picture';

export const GET_PARTNER_BY_SLUG_LOGIC_FUNCTION_ID =
  '5e3e7b88-2cf2-4f56-9a4a-46c4c1d6b0bb';

// CoreApiClient is codegenerated from the synced workspace schema, so the
// selection is strictly typed and the response shape derives from it.
const queryPartnerBySlug = (client: CoreApiClient, slug: string) =>
  client.query({
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
          // profilePicture is the legacy LINKS url; profilePictureFile is the
          // new FILES upload (its items expose `url`). Display prefers the file.
          profilePicture: { primaryLinkUrl: true },
          profilePictureFile: { url: true },
          skills: true,
          city: true,
          country: true,
        },
      },
    },
  });

type PartnerRaw = NonNullable<
  Awaited<ReturnType<typeof queryPartnerBySlug>>['partners']
>['edges'][number]['node'];

type Partner = Omit<PartnerRaw, 'profilePicture' | 'profilePictureFile'> & {
  profilePicture: { primaryLinkUrl: string | null };
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
    const result = await queryPartnerBySlug(client, slug);
    const rawNode = result.partners?.edges?.[0]?.node;

    if (!rawNode) {
      return { ok: false, reason: 'NOT_FOUND' };
    }

    const { profilePictureFile, ...rest } = rawNode;
    const partner: Partner = {
      ...rest,
      profilePicture: {
        primaryLinkUrl: resolvePartnerPictureUrl(
          profilePictureFile,
          rawNode.profilePicture?.primaryLinkUrl,
        ),
      },
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
