import { type CoreSchema } from 'twenty-client-sdk/core';

import { isCaseStudy } from './content-type';
import { firstFileUrl, resolvePartnerPictureUrl } from './profile-picture';
import { stripMarkdown } from './strip-markdown';

export type MapPartnerDetail = 'list' | 'profile';

type PrimaryLink = { primaryLinkUrl: string | null };
type Money = { amountMicros: number; currencyCode: string } | null;
type FileItemRead = { url?: string | null } | null | undefined;

type PartnerLinkEdge = {
  node: {
    url: PrimaryLink | null;
    sortOrder: number | null;
    position: number | null;
  };
};

type PartnerServiceEdge = {
  node: {
    title: string | null;
    description: string | null;
    sortOrder: number | null;
    position: number | null;
  };
};

type PartnerContentEdge = {
  node: {
    contentType: string | readonly string[] | null;
    status: string | null;
    clientName: string | null;
    headline: string | null;
    body: { markdown: string | null } | null;
    coverImage?: ReadonlyArray<FileItemRead> | null;
    coverImageUrl?: string | null;
    caseStudyLink: PrimaryLink | null;
    position: number | null;
  };
};

export type PartnerMarketplaceQueryNode = {
  name: string;
  slug: string;
  introduction: string | null;
  languagesSpoken: CoreSchema.Partner['languagesSpoken'];
  deploymentExpertise: CoreSchema.Partner['deploymentExpertise'];
  partnerScope: CoreSchema.Partner['partnerScope'];
  region: CoreSchema.Partner['region'];
  calendarLink: PrimaryLink;
  hourlyRate: Money;
  projectBudgetMin: Money;
  linkedin: PrimaryLink;
  website: PrimaryLink;
  profilePicture: PrimaryLink;
  profilePictureFile?: ReadonlyArray<FileItemRead> | null;
  skills: string[] | null;
  city: string | null;
  country: string | null;
  partnerLinks?: { edges: ReadonlyArray<PartnerLinkEdge> } | null;
  partnerServices?: { edges: ReadonlyArray<PartnerServiceEdge> } | null;
  partnerContents?: { edges: ReadonlyArray<PartnerContentEdge> } | null;
};

export type MarketplaceListPartner = {
  name: string;
  slug: string;
  introduction: string;
  languagesSpoken: CoreSchema.Partner['languagesSpoken'];
  deploymentExpertise: CoreSchema.Partner['deploymentExpertise'];
  partnerScope: CoreSchema.Partner['partnerScope'];
  region: CoreSchema.Partner['region'];
  calendarLink: PrimaryLink;
  hourlyRate: Money;
  projectBudgetMin: Money;
  linkedin: PrimaryLink;
  website: PrimaryLink;
  profilePicture: PrimaryLink;
  skills: string[] | null;
  city: string | null;
  country: string | null;
};

export type MarketplaceProfilePartner = MarketplaceListPartner & {
  introduction: string;
  projectBudgetTypical: MarketplaceListPartner['projectBudgetMin'];
  profileLinks: PrimaryLink[];
  services: { title: string; description: string }[];
  portfolio: {
    client: string;
    title: string;
    body: string;
    imageUrl: string | null;
    link: string | null;
  }[];
};

const LIST_INTRODUCTION_MAX_LENGTH = 220;

const richTextSource = (node: PartnerMarketplaceQueryNode): string =>
  node.introduction?.trim() ?? '';

const toListIntroduction = (node: PartnerMarketplaceQueryNode): string => {
  return stripMarkdown(richTextSource(node))
    .slice(0, LIST_INTRODUCTION_MAX_LENGTH)
    .trim();
};

const toProfileIntroduction = (node: PartnerMarketplaceQueryNode): string =>
  richTextSource(node);

const sortOrderValue = (node: {
  sortOrder?: number | null;
  position?: number | null;
}): number | null => node.sortOrder ?? node.position ?? null;

const sortBySortOrderAscNullsLast = <
  T extends { node: { sortOrder?: number | null; position?: number | null } },
>(
  edges: ReadonlyArray<T>,
): T[] =>
  [...edges].sort((left, right) => {
    const leftOrder = sortOrderValue(left.node);
    const rightOrder = sortOrderValue(right.node);

    if (leftOrder === null && rightOrder === null) {
      return 0;
    }

    if (leftOrder === null) {
      return 1;
    }

    if (rightOrder === null) {
      return -1;
    }

    return leftOrder - rightOrder;
  });

const sortByPositionAscNullsLast = <T extends { node: { position: number | null } }>(
  edges: ReadonlyArray<T>,
): T[] =>
  [...edges].sort((left, right) => {
    if (left.node.position === null && right.node.position === null) {
      return 0;
    }

    if (left.node.position === null) {
      return 1;
    }

    if (right.node.position === null) {
      return -1;
    }

    return left.node.position - right.node.position;
  });

const dedupeUrls = (urls: ReadonlyArray<string | null>): string[] => {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const url of urls) {
    if (!url || seen.has(url)) {
      continue;
    }

    seen.add(url);
    deduped.push(url);
  }

  return deduped;
};

const mapProfileLinks = (node: PartnerMarketplaceQueryNode): PrimaryLink[] => {
  const partnerLinkUrls = sortBySortOrderAscNullsLast(node.partnerLinks?.edges ?? [])
    .map((edge) => edge.node.url?.primaryLinkUrl ?? null);

  const legacyUrls = [
    node.website?.primaryLinkUrl ?? null,
    node.linkedin?.primaryLinkUrl ?? null,
  ];

  return dedupeUrls([...partnerLinkUrls, ...legacyUrls]).map((url) => ({
    primaryLinkUrl: url,
  }));
};

const mapServices = (
  edges: ReadonlyArray<PartnerServiceEdge>,
): Array<{ title: string; description: string }> =>
  sortBySortOrderAscNullsLast(edges).map(({ node }) => ({
    title: node.title ?? '',
    description: node.description ?? '',
  }));

const mapPortfolio = (
  edges: ReadonlyArray<PartnerContentEdge>,
): MarketplaceProfilePartner['portfolio'] =>
  sortByPositionAscNullsLast(edges)
    .filter(({ node }) => isCaseStudy(node.contentType) && node.status === 'APPROVED')
    .map(({ node }) => ({
      client: node.clientName ?? '',
      title: node.headline ?? '',
      body: node.body?.markdown ?? '',
      imageUrl: node.coverImageUrl ?? firstFileUrl(node.coverImage),
      link: node.caseStudyLink?.primaryLinkUrl ?? null,
    }));

const mapBasePartner = (
  node: PartnerMarketplaceQueryNode,
  detail: MapPartnerDetail,
): MarketplaceListPartner => ({
  name: node.name,
  slug: node.slug,
  introduction:
    detail === 'list' ? toListIntroduction(node) : toProfileIntroduction(node),
  languagesSpoken: node.languagesSpoken,
  deploymentExpertise: node.deploymentExpertise,
  partnerScope: node.partnerScope,
  region: node.region,
  calendarLink: node.calendarLink,
  hourlyRate: node.hourlyRate,
  projectBudgetMin: node.projectBudgetMin,
  linkedin: node.linkedin,
  website: node.website,
  profilePicture: {
    primaryLinkUrl: resolvePartnerPictureUrl(
      node.profilePictureFile,
      node.profilePicture?.primaryLinkUrl,
    ),
  },
  skills: node.skills,
  city: node.city,
  country: node.country,
});

export function mapPartnerForMarketplace(
  node: PartnerMarketplaceQueryNode,
  detail: MapPartnerDetail,
): MarketplaceListPartner | MarketplaceProfilePartner {
  const base = mapBasePartner(node, detail);

  if (detail === 'list') {
    return base;
  }

  return {
    ...base,
    projectBudgetTypical: base.projectBudgetMin,
    profileLinks: mapProfileLinks(node),
    services: mapServices(node.partnerServices?.edges ?? []),
    portfolio: mapPortfolio(node.partnerContents?.edges ?? []),
  };
}
