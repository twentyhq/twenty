import { CoreApiClient } from 'twenty-client-sdk/core';

import { queryAvailablePartners } from 'src/modules/partner/marketplace/graphql/queries/list-available-partners';
import {
  mapPartnerForMarketplace,
  type MarketplaceListPartner,
} from 'src/modules/partner/marketplace/mappers/map-partner-for-marketplace.mapper';
import { isCaseStudy } from 'src/modules/partner/utils/content-type';

import { createWeeklyRotationKey } from '../utils/create-weekly-rotation-key';

type AvailablePartnerRaw = NonNullable<
  Awaited<ReturnType<typeof queryAvailablePartners>>['partners']
>['edges'][number]['node'];

export type MarketplaceRankedListPartner = MarketplaceListPartner & {
  partnerTier: AvailablePartnerRaw['partnerTier'];
  serviceCount: number;
  approvedCaseStudyCount: number;
  rotationKey: string;
};

export type ListAvailablePartnersResult =
  | { ok: true; count: number; partners: MarketplaceRankedListPartner[] }
  | { ok: false; reason: string };

const mapListPartner = (
  node: AvailablePartnerRaw,
): MarketplaceRankedListPartner => {
  const mapped = mapPartnerForMarketplace(node, 'list');

  if ('projectBudgetTypical' in mapped) {
    throw new Error(
      'list-available-partners received profile payload from list mapper',
    );
  }

  return {
    ...mapped,
    partnerTier: node.partnerTier,
    serviceCount: node.partnerServices?.edges.length ?? 0,
    approvedCaseStudyCount: (node.partnerContents?.edges ?? []).filter(
      ({ node: content }) =>
        isCaseStudy(content.contentType) && content.status === 'APPROVED',
    ).length,
    rotationKey: createWeeklyRotationKey(node.id),
  };
};

export const listAvailablePartners = async (): Promise<ListAvailablePartnersResult> => {
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
