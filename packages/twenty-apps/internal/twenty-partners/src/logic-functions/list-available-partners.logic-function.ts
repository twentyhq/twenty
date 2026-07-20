import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  mapPartnerForMarketplace,
  type MarketplaceListPartner,
} from './map-partner-for-marketplace';

export const LIST_AVAILABLE_PARTNERS_LOGIC_FUNCTION_ID =
  '0f91164f-f492-41e8-9bb0-481be5a3d5b9';

// CoreApiClient is codegenerated from the synced workspace schema, so the query
// selection is strictly typed. Keep the fetch in one place and derive the
// response shape from it, so the HTTP contract can never drift from what we
// actually ask the API for.
const queryAvailablePartners = (client: CoreApiClient) =>
  client.query({
    partners: {
      __args: {
        filter: {
          validationStage: { eq: 'VALIDATED' },
          availability: { eq: 'AVAILABLE' },
          slug: { neq: '' },
        },
        orderBy: [{ name: 'AscNullsLast' }],
        first: 100,
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
          website: { primaryLinkUrl: true },
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

type AvailablePartnerRaw = NonNullable<
  Awaited<ReturnType<typeof queryAvailablePartners>>['partners']
>['edges'][number]['node'];

type ListAvailablePartnersResult =
  | { ok: true; count: number; partners: MarketplaceListPartner[] }
  | { ok: false; reason: string };

const mapListPartner = (node: AvailablePartnerRaw): MarketplaceListPartner => {
  const mapped = mapPartnerForMarketplace(node, 'list');

  if ('projectBudgetTypical' in mapped) {
    throw new Error(
      'list-available-partners received profile payload from list mapper',
    );
  }

  return mapped;
};

export const handler = async (): Promise<ListAvailablePartnersResult> => {
  try {
    const client = new CoreApiClient();
    const result = await queryAvailablePartners(client);
    const partners = (result.partners?.edges ?? []).map(({ node }) =>
      mapListPartner(node),
    );

    return { ok: true, count: partners.length, partners };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: LIST_AVAILABLE_PARTNERS_LOGIC_FUNCTION_ID,
  name: 'list-available-partners',
  description: 'Returns all partners with validationStage=VALIDATED and availability=AVAILABLE.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/partners',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
