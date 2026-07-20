import { CoreApiClient } from 'twenty-client-sdk/core';
import { type RoutePayload } from 'twenty-sdk/define';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { handler } from '../get-my-partner-profile.logic-function';

function requireId(id: string | null | undefined, what: string): string {
  if (!id) throw new Error(`${what} returned no id`);
  return id;
}

async function getWorkspaceMember(
  client: CoreApiClient,
): Promise<{ id: string; userId: string }> {
  const r = await client.query({
    workspaceMembers: {
      __args: { first: 1 },
      edges: { node: { id: true, userId: true } },
    },
  });
  const node = r.workspaceMembers?.edges?.[0]?.node;
  if (!node?.id || !node?.userId) {
    throw new Error('No workspace members found — cannot run test');
  }
  return { id: node.id, userId: node.userId };
}

async function createPartner(client: CoreApiClient, memberId: string): Promise<string> {
  const r = await client.mutation({
    createPartner: {
      __args: {
        data: {
          name: `[test-my-profile] partner ${Date.now()}`,
          slug: `test-my-profile-${Date.now()}`,
          partnerUserId: memberId,
          city: 'Paris',
          introduction: 'Senior implementation partner.',
        },
      },
      id: true,
    },
  });
  return requireId(r.createPartner?.id, 'createPartner');
}

async function destroyPartner(client: CoreApiClient, id: string) {
  await client.mutation({ destroyPartner: { __args: { id }, id: true } }).catch(() => {});
}

async function createPartnerLink(
  client: CoreApiClient,
  partnerId: string,
  memberId: string,
): Promise<string> {
  const r = await client.mutation({
    createPartnerLink: {
      __args: {
        data: {
          name: 'Case studies',
          url: { primaryLinkUrl: 'https://example.com/case-studies' },
          sortOrder: 1,
          partnerId,
          partnerUserId: memberId,
        },
      },
      id: true,
    },
  });
  return requireId(r.createPartnerLink?.id, 'createPartnerLink');
}

async function destroyPartnerLink(client: CoreApiClient, id: string) {
  await client.mutation({ destroyPartnerLink: { __args: { id }, id: true } }).catch(() => {});
}

async function createPartnerService(
  client: CoreApiClient,
  partnerId: string,
  memberId: string,
): Promise<string> {
  const r = await client.mutation({
    createPartnerService: {
      __args: {
        data: {
          title: 'Data migration',
          description: 'Historical sync and schema mapping.',
          sortOrder: 1,
          partnerId,
          partnerUserId: memberId,
        },
      },
      id: true,
    },
  });
  return requireId(r.createPartnerService?.id, 'createPartnerService');
}

async function destroyPartnerService(client: CoreApiClient, id: string) {
  await client.mutation({ destroyPartnerService: { __args: { id }, id: true } }).catch(() => {});
}

async function createPartnerContent(
  client: CoreApiClient,
  partnerId: string,
  memberId: string,
  name: string,
): Promise<string> {
  const r = await client.mutation({
    createPartnerContent: {
      __args: {
        data: {
          name,
          contentType: ['CASE_STUDY'],
          status: 'APPROVED',
          clientName: 'Acme Corp',
          headline: 'CRM migration',
          body: { markdown: 'Moved 12 teams to Twenty.' },
          caseStudyLink: { primaryLinkUrl: 'https://example.com/case-study' },
          partnerId,
          partnerUserId: memberId,
        },
      },
      id: true,
    },
  });
  return requireId(r.createPartnerContent?.id, 'createPartnerContent');
}

async function destroyPartnerContent(client: CoreApiClient, id: string) {
  await client.mutation({ destroyPartnerContent: { __args: { id }, id: true } }).catch(() => {});
}

const makeToken = (payload: Record<string, unknown>): string => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${body}.sig`;
};

const makeRouteEvent = (userWorkspaceId: string | null): RoutePayload<unknown> => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body: null,
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/my-partner-profile' } },
  userWorkspaceId,
});

// Invoke the handler directly against a live workspace, crafting the same short-lived env
// token resolvePartnerFromRequest decodes (see resolve-partner-from-request.test.ts), so the
// full identity → profile path is exercised without a real authenticated HTTP request.
describe('get-my-partner-profile', () => {
  let client: CoreApiClient;
  const originalToken = process.env.TWENTY_APP_ACCESS_TOKEN;

  const createdPartnerIds: string[] = [];
  const createdLinkIds: string[] = [];
  const createdServiceIds: string[] = [];
  const createdContentIds: string[] = [];

  beforeEach(() => {
    client = new CoreApiClient();
  });

  afterEach(async () => {
    if (originalToken === undefined) delete process.env.TWENTY_APP_ACCESS_TOKEN;
    else process.env.TWENTY_APP_ACCESS_TOKEN = originalToken;

    for (const id of createdLinkIds.splice(0)) await destroyPartnerLink(client, id);
    for (const id of createdServiceIds.splice(0)) await destroyPartnerService(client, id);
    for (const id of createdContentIds.splice(0)) await destroyPartnerContent(client, id);
    for (const id of createdPartnerIds.splice(0)) await destroyPartner(client, id);
  });

  it('returns UNAUTHENTICATED when the event has no userWorkspaceId', async () => {
    const result = await handler(makeRouteEvent(null));

    expect(result).toEqual({ ok: false, reason: 'UNAUTHENTICATED' });
  });

  it('returns NO_PARTNER when the token userId matches no workspace member', async () => {
    const userWorkspaceId = `uw-test-nomember-${Date.now()}`;
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({
      userId: '11111111-1111-4111-8111-111111111111',
      userWorkspaceId,
    });

    const result = await handler(makeRouteEvent(userWorkspaceId));

    expect(result).toEqual({ ok: false, reason: 'NO_PARTNER' });
  });

  it("returns the calling partner's profile with links, services, and case studies", async () => {
    const member = await getWorkspaceMember(client);
    const partnerId = await createPartner(client, member.id);
    createdPartnerIds.push(partnerId);

    const linkId = await createPartnerLink(client, partnerId, member.id);
    createdLinkIds.push(linkId);
    const serviceId = await createPartnerService(client, partnerId, member.id);
    createdServiceIds.push(serviceId);
    const caseStudyName = `[test-my-profile] case study ${Date.now()}`;
    const contentId = await createPartnerContent(client, partnerId, member.id, caseStudyName);
    createdContentIds.push(contentId);

    const userWorkspaceId = `uw-test-${Date.now()}`;
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({
      userId: member.userId,
      userWorkspaceId,
    });

    const result = await handler(makeRouteEvent(userWorkspaceId));

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.profile.id).toBe(partnerId);
    expect(result.profile.city).toBe('Paris');
    expect(result.profile.introduction).toBe('Senior implementation partner.');
    expect(result.profile.links).toEqual([
      {
        id: linkId,
        name: 'Case studies',
        url: 'https://example.com/case-studies',
        sortOrder: 1,
      },
    ]);
    expect(result.profile.services).toEqual([
      {
        id: serviceId,
        title: 'Data migration',
        description: 'Historical sync and schema mapping.',
        sortOrder: 1,
      },
    ]);
    expect(result.profile.caseStudies).toEqual([
      {
        id: contentId,
        name: caseStudyName,
        clientName: 'Acme Corp',
        headline: 'CRM migration',
        bodyMarkdown: 'Moved 12 teams to Twenty.',
        coverImageUrl: null,
        caseStudyLink: 'https://example.com/case-study',
        status: 'APPROVED',
      },
    ]);
    expect(result.options.partnerScope[0]).toEqual({
      value: 'ADVISORY',
      label: 'Advisory & Discovery',
    });
  });
});
