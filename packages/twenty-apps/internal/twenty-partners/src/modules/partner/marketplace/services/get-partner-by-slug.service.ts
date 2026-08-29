import { CoreApiClient } from 'twenty-client-sdk/core';

import { queryPartnerBySlug } from 'src/modules/partner/marketplace/graphql/queries/get-partner-by-slug';
import {
  mapPartnerForMarketplace,
  type MarketplaceProfilePartner,
} from 'src/modules/partner/marketplace/mappers/map-partner-for-marketplace.mapper';

type PartnerRaw = NonNullable<
  Awaited<ReturnType<typeof queryPartnerBySlug>>['partners']
>['edges'][number]['node'];

export type GetPartnerBySlugResult =
  | { ok: true; partner: MarketplaceProfilePartner }
  | { ok: false; reason: 'NOT_FOUND' | string };

const mapProfilePartner = (node: PartnerRaw): MarketplaceProfilePartner => {
  const mapped = mapPartnerForMarketplace(node, 'profile');

  if (!('projectBudgetTypical' in mapped)) {
    throw new Error(
      'get-partner-by-slug received list payload from profile mapper',
    );
  }

  return mapped;
};

export const getPartnerBySlug = async (input: {
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

    const partner = mapProfilePartner(rawNode);

    return { ok: true, partner };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
};
