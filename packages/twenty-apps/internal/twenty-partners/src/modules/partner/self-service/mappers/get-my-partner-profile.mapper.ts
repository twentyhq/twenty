import type { findMyPartnerProfile } from 'src/modules/partner/self-service/graphql/queries/find-my-partner-profile';
import { isCaseStudy } from 'src/modules/partner/utils/content-type';
import { firstFileUrl } from 'src/modules/partner/utils/profile-picture';

export type MyProfilePayload = {
  id: string;
  name: string | null;
  introduction: string | null;
  city: string | null;
  country: string | null;
  languagesSpoken: string[] | null;
  partnerScope: string[] | null;
  skills: string[] | null;
  typeOfTeam: string | null;
  availability: string | null;
  hourlyRate: { amountMicros: number | null; currencyCode: string | null } | null;
  projectBudgetMin: { amountMicros: number | null; currencyCode: string | null } | null;
  website: string | null;
  linkedin: string | null;
  calendarLink: string | null;
  profilePicture: string | null;
  profilePictureUrl: string | null;
  region: string[] | null;
  deploymentExpertise: string[] | null;
  links: { id: string; name: string | null; url: string | null; sortOrder: number | null }[];
  services: {
    id: string;
    title: string | null;
    description: string | null;
    sortOrder: number | null;
  }[];
  caseStudies: {
    id: string;
    name: string | null;
    clientName: string | null;
    headline: string | null;
    bodyMarkdown: string | null;
    coverImageUrl: string | null;
    caseStudyLink: string | null;
    status: string | null;
  }[];
};

export type PartnerNode = NonNullable<
  Awaited<ReturnType<typeof findMyPartnerProfile>>['partners']
>['edges'][number]['node'];

export const mapMyProfilePayload = (node: PartnerNode): MyProfilePayload => ({
  id: node.id,
  name: node.name ?? null,
  introduction: node.introduction ?? null,
  city: node.city ?? null,
  country: node.country ?? null,
  languagesSpoken: node.languagesSpoken ?? null,
  partnerScope: node.partnerScope ?? null,
  skills: node.skills ?? null,
  typeOfTeam: node.typeOfTeam ?? null,
  availability: node.availability ?? null,
  hourlyRate: node.hourlyRate ?? null,
  projectBudgetMin: node.projectBudgetMin ?? null,
  website: node.website?.primaryLinkUrl ?? null,
  linkedin: node.linkedin?.primaryLinkUrl ?? null,
  calendarLink: node.calendarLink?.primaryLinkUrl ?? null,
  profilePicture: node.profilePicture?.primaryLinkUrl ?? null,
  profilePictureUrl:
    firstFileUrl(node.profilePictureFile) ?? node.profilePicture?.primaryLinkUrl ?? null,
  region: node.region ?? null,
  deploymentExpertise: node.deploymentExpertise ?? null,
  links: (node.partnerLinks?.edges ?? []).map((e) => ({
    id: e.node.id,
    name: e.node.name ?? null,
    url: e.node.url?.primaryLinkUrl ?? null,
    sortOrder: e.node.sortOrder ?? null,
  })),
  services: (node.partnerServices?.edges ?? []).map((e) => ({
    id: e.node.id,
    title: e.node.title ?? null,
    description: e.node.description ?? null,
    sortOrder: e.node.sortOrder ?? null,
  })),
  caseStudies: (node.partnerContents?.edges ?? [])
    .filter((e) => isCaseStudy(e.node.contentType))
    .map((e) => ({
      id: e.node.id,
      name: e.node.name ?? null,
      clientName: e.node.clientName ?? null,
      headline: e.node.headline ?? null,
      bodyMarkdown: e.node.body?.markdown ?? null,
      // Edit form binds the text coverImageUrl field only; the file cover's signed URL
      // must not round-trip through save (it would persist an expiring URL).
      coverImageUrl: e.node.coverImageUrl || null,
      caseStudyLink: e.node.caseStudyLink?.primaryLinkUrl ?? null,
      status: e.node.status ?? null,
    })),
});
