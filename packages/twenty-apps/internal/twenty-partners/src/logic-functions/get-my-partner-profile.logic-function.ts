import { type CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { PROFILE_OPTIONS, type ProfileOptions } from 'src/constants/my-profile.constants';

import { isCaseStudy } from './content-type';
import { firstFileUrl } from './profile-picture';
import { buildAppClient, errorResponse, failureResponse, resolvePartnerFromRequest } from './resolve-partner-from-request';

export const GET_MY_PARTNER_PROFILE_ID = 'eacfd95b-de02-4f03-aa38-3cae31bb30a9';

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

export type MyPartnerProfileResult =
  | { ok: true; profile: MyProfilePayload; options: ProfileOptions }
  | { ok: false; reason: string };

// CoreApiClient is codegenerated from the synced workspace schema, so the
// selection is strictly typed and the response shape derives from it.
const queryMyPartnerProfile = (client: CoreApiClient, partnerId: string) =>
  client.query({
    partners: {
      __args: {
        filter: { id: { eq: partnerId } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          name: true,
          introduction: true,
          city: true,
          country: true,
          languagesSpoken: true,
          partnerScope: true,
          skills: true,
          typeOfTeam: true,
          availability: true,
          hourlyRate: { amountMicros: true, currencyCode: true },
          projectBudgetMin: { amountMicros: true, currencyCode: true },
          website: { primaryLinkUrl: true },
          linkedin: { primaryLinkUrl: true },
          calendarLink: { primaryLinkUrl: true },
          profilePicture: { primaryLinkUrl: true },
          profilePictureFile: { url: true },
          region: true,
          deploymentExpertise: true,
          partnerLinks: {
            edges: {
              node: {
                id: true,
                name: true,
                url: { primaryLinkUrl: true },
                sortOrder: true,
              },
            },
          },
          partnerServices: {
            edges: {
              node: {
                id: true,
                title: true,
                description: true,
                sortOrder: true,
              },
            },
          },
          partnerContents: {
            edges: {
              node: {
                id: true,
                name: true,
                clientName: true,
                headline: true,
                body: { markdown: true },
                coverImageUrl: true,
                caseStudyLink: { primaryLinkUrl: true },
                status: true,
                contentType: true,
              },
            },
          },
        },
      },
    },
  });

export type PartnerNode = NonNullable<
  Awaited<ReturnType<typeof queryMyPartnerProfile>>['partners']
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

export const handler = async (
  event: RoutePayload<unknown>,
): Promise<MyPartnerProfileResult> => {
  const resolved = await resolvePartnerFromRequest(event);
  if ('error' in resolved) return errorResponse(resolved.error);

  try {
    const client = buildAppClient();
    const result = await queryMyPartnerProfile(client, resolved.partnerId);
    const node = result.partners?.edges?.[0]?.node;

    if (!node) {
      return errorResponse('NO_PARTNER');
    }

    return { ok: true, profile: mapMyProfilePayload(node), options: PROFILE_OPTIONS };
  } catch (err) {
    return failureResponse('get-my-partner-profile', err);
  }
};

export default defineLogicFunction({
  universalIdentifier: GET_MY_PARTNER_PROFILE_ID,
  name: 'get-my-partner-profile',
  description:
    "Returns the calling partner's own profile + links + services + case studies + enum options.",
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/my-partner-profile',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
