import { CoreApiClient } from 'twenty-client-sdk/core';

import { queryAvailablePartners } from 'src/modules/partner/marketplace/graphql/queries/list-available-partners';
import {
  mapPartnerForMarketplace,
  type MarketplaceListPartner,
} from 'src/modules/partner/marketplace/mappers/map-partner-for-marketplace.mapper';
import { isApprovedCaseStudy } from 'src/modules/partner/utils/content-type';
import { resolveCoverUrl } from 'src/modules/partner/utils/profile-picture';
import { createWeeklyRotationKey } from 'src/modules/partner/marketplace/utils/create-weekly-rotation-key';

type AvailablePartnerRaw = NonNullable<
  Awaited<ReturnType<typeof queryAvailablePartners>>['partners']
>['edges'][number]['node'];

export type MarketplaceRankedListPartner = MarketplaceListPartner & {
  partnerTier: AvailablePartnerRaw['partnerTier'];
  serviceCount: number;
  approvedCaseStudyCount: number;
  approvedCaseStudyWithCoverCount: number;
  rotationKey: string;
};

export type ListAvailablePartnersResult =
  | { ok: true; count: number; partners: MarketplaceRankedListPartner[] }
  | { ok: false; reason: string };

const mapListPartner = (
  node: AvailablePartnerRaw,
  rotationDate: Date,
): MarketplaceRankedListPartner => {
  const mapped = mapPartnerForMarketplace(node, 'list');

  if ('projectBudgetTypical' in mapped) {
    throw new Error(
      'list-available-partners received profile payload from list mapper',
    );
  }

  const approvedCaseStudies = (node.partnerContents?.edges ?? []).filter(
    ({ node: content }) => isApprovedCaseStudy(content),
  );

  return {
    ...mapped,
    partnerTier: node.partnerTier,
    serviceCount: (node.partnerServices?.edges ?? []).length,
    approvedCaseStudyCount: approvedCaseStudies.length,
    approvedCaseStudyWithCoverCount: approvedCaseStudies.filter(
      ({ node: content }) =>
        resolveCoverUrl(content.coverImageUrl, content.coverImage) !== null,
    ).length,
    rotationKey: createWeeklyRotationKey(node.id, rotationDate),
  };
};

export const listAvailablePartners = async (): Promise<ListAvailablePartnersResult> => {
  try {
    const client = new CoreApiClient();
    const result = await queryAvailablePartners(client);
    // One clock read for the whole response: a request that straddles the UTC
    // Monday boundary would otherwise mix keys from two weeks in one sort.
    const rotationDate = new Date();
    const partners = (result.partners?.edges ?? []).map(({ node }) =>
      mapListPartner(node, rotationDate),
    );

    return { ok: true, count: partners.length, partners };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
};
