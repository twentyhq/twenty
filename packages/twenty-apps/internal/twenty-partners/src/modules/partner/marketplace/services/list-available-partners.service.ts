import { CoreApiClient } from 'twenty-client-sdk/core';

import { queryAvailablePartners } from 'src/modules/partner/marketplace/graphql/queries/list-available-partners';
import {
  mapPartnerForMarketplace,
  type MarketplaceListPartner,
} from 'src/modules/partner/marketplace/mappers/map-partner-for-marketplace.mapper';
import { isCaseStudy } from 'src/modules/partner/utils/content-type';
import { firstFileUrl } from 'src/modules/partner/utils/profile-picture';

import { createWeeklyRotationKey } from '../utils/create-weekly-rotation-key';

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

// coverImageUrl is TEXT, so an empty string means "no cover", not null.
const hasCover = (content: {
  coverImageUrl?: string | null;
  coverImage?: ReadonlyArray<{ url?: string | null } | null> | null;
}): boolean =>
  (content.coverImageUrl ?? '').trim().length > 0 ||
  firstFileUrl(content.coverImage) !== null;

const mapListPartner = (
  node: AvailablePartnerRaw,
): MarketplaceRankedListPartner => {
  const mapped = mapPartnerForMarketplace(node, 'list');

  if ('projectBudgetTypical' in mapped) {
    throw new Error(
      'list-available-partners received profile payload from list mapper',
    );
  }

  const approvedCaseStudies = (node.partnerContents?.edges ?? []).filter(
    ({ node: content }) =>
      isCaseStudy(content.contentType) && content.status === 'APPROVED',
  );

  return {
    ...mapped,
    partnerTier: node.partnerTier,
    serviceCount: node.partnerServices?.edges.length ?? 0,
    approvedCaseStudyCount: approvedCaseStudies.length,
    approvedCaseStudyWithCoverCount:
      approvedCaseStudies.filter(({ node: content }) => hasCover(content))
        .length,
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
