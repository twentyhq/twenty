import { CoreApiClient } from 'twenty-client-sdk/core';
import { type RoutePayload } from 'twenty-sdk/define';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { handler } from '../upload-my-partner-file.logic-function';

// A valid 1x1 transparent PNG, base64-encoded — small, deterministic, real image bytes.
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

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
          name: `[test-upload] partner ${Date.now()}`,
          slug: `test-upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          partnerUserId: memberId,
        },
      },
      id: true,
    },
  });
  return requireId(r.createPartner?.id, 'createPartner');
}

// A partner not linked to any workspace member — owns the "foreign" case study
// content used to prove the ownership check refuses cross-partner uploads.
async function createUnlinkedPartner(client: CoreApiClient): Promise<string> {
  const r = await client.mutation({
    createPartner: {
      __args: {
        data: {
          name: `[test-upload] other partner ${Date.now()}`,
          slug: `test-upload-other-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

async function createPartnerContent(
  client: CoreApiClient,
  partnerId: string,
  memberId?: string,
): Promise<string> {
  const r = await client.mutation({
    createPartnerContent: {
      __args: {
        data: {
          name: `[test-upload] case study ${Date.now()}`,
          contentType: ['CASE_STUDY'],
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

async function getPartner(client: CoreApiClient, id: string) {
  const r = await client.query({
    partners: {
      __args: { filter: { id: { eq: id } }, first: 1 },
      edges: { node: { id: true, profilePictureFile: { url: true } } },
    },
  });
  const node = r.partners?.edges?.[0]?.node;
  if (!node) throw new Error(`partner ${id} not found`);
  return node;
}

async function getPartnerContent(client: CoreApiClient, id: string) {
  const r = await client.query({
    partnerContents: {
      __args: { filter: { id: { eq: id } }, first: 1 },
      edges: { node: { id: true, coverImage: { url: true } } },
    },
  });
  const node = r.partnerContents?.edges?.[0]?.node;
  if (!node) throw new Error(`partnerContent ${id} not found`);
  return node;
}

const makeToken = (payload: Record<string, unknown>): string => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${body}.sig`;
};

const makeRouteEvent = (
  userWorkspaceId: string | null,
  body: unknown,
): RoutePayload<unknown> => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body,
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/upload-my-partner-file' } },
  userWorkspaceId,
});

// Invoke the handler directly against a live workspace, crafting the same short-lived env
// token resolvePartnerFromRequest decodes (see resolve-partner-from-request.test.ts), so the
// full identity → upload → attach path is exercised without a real authenticated HTTP request,
// and without a real multipart request against the running server.
describe('upload-my-partner-file', () => {
  let client: CoreApiClient;
  const originalToken = process.env.TWENTY_APP_ACCESS_TOKEN;

  const createdPartnerIds: string[] = [];
  const createdContentIds: string[] = [];

  beforeEach(() => {
    client = new CoreApiClient();
  });

  afterEach(async () => {
    if (originalToken === undefined) delete process.env.TWENTY_APP_ACCESS_TOKEN;
    else process.env.TWENTY_APP_ACCESS_TOKEN = originalToken;

    for (const id of createdContentIds.splice(0)) await destroyPartnerContent(client, id);
    for (const id of createdPartnerIds.splice(0)) await destroyPartner(client, id);
  });

  it('returns UNAUTHENTICATED when the event has no userWorkspaceId', async () => {
    const result = await handler(
      makeRouteEvent(null, {
        target: 'profilePicture',
        filename: 'avatar.png',
        contentType: 'image/png',
        dataBase64: TINY_PNG_BASE64,
      }),
    );

    expect(result).toEqual({ ok: false, reason: 'UNAUTHENTICATED' });
  });

  it('rejects a caseStudyCover upload with no recordId', async () => {
    const member = await getWorkspaceMember(client);
    const partnerId = await createPartner(client, member.id);
    createdPartnerIds.push(partnerId);

    const userWorkspaceId = `uw-test-norecord-${Date.now()}`;
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({ userId: member.userId, userWorkspaceId });

    const result = await handler(
      makeRouteEvent(userWorkspaceId, {
        target: 'caseStudyCover',
        filename: 'cover.png',
        contentType: 'image/png',
        dataBase64: TINY_PNG_BASE64,
      }),
    );

    expect(result).toEqual({
      ok: false,
      reason: 'recordId is required for caseStudyCover uploads',
    });
  });

  it('uploads and attaches a profile picture for the calling partner', async () => {
    const member = await getWorkspaceMember(client);
    const partnerId = await createPartner(client, member.id);
    createdPartnerIds.push(partnerId);

    const userWorkspaceId = `uw-test-picture-${Date.now()}`;
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({ userId: member.userId, userWorkspaceId });

    const result = await handler(
      makeRouteEvent(userWorkspaceId, {
        target: 'profilePicture',
        filename: 'avatar.png',
        contentType: 'image/png',
        dataBase64: TINY_PNG_BASE64,
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(typeof result.url).toBe('string');

    const partner = await getPartner(client, partnerId);
    expect(partner.profilePictureFile?.[0]?.url).toBeTruthy();
  });

  it('uploads and attaches a case study cover for content the partner owns', async () => {
    const member = await getWorkspaceMember(client);
    const partnerId = await createPartner(client, member.id);
    createdPartnerIds.push(partnerId);
    const contentId = await createPartnerContent(client, partnerId, member.id);
    createdContentIds.push(contentId);

    const userWorkspaceId = `uw-test-cover-${Date.now()}`;
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({ userId: member.userId, userWorkspaceId });

    const result = await handler(
      makeRouteEvent(userWorkspaceId, {
        target: 'caseStudyCover',
        recordId: contentId,
        filename: 'cover.png',
        contentType: 'image/png',
        dataBase64: TINY_PNG_BASE64,
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(typeof result.url).toBe('string');

    const content = await getPartnerContent(client, contentId);
    expect(content.coverImage?.[0]?.url).toBeTruthy();
  });

  it('refuses a case study cover upload for content owned by another partner', async () => {
    const member = await getWorkspaceMember(client);
    const myPartnerId = await createPartner(client, member.id);
    createdPartnerIds.push(myPartnerId);
    const otherPartnerId = await createUnlinkedPartner(client);
    createdPartnerIds.push(otherPartnerId);
    const foreignContentId = await createPartnerContent(client, otherPartnerId);
    createdContentIds.push(foreignContentId);

    const userWorkspaceId = `uw-test-forbidden-${Date.now()}`;
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({ userId: member.userId, userWorkspaceId });

    const result = await handler(
      makeRouteEvent(userWorkspaceId, {
        target: 'caseStudyCover',
        recordId: foreignContentId,
        filename: 'cover.png',
        contentType: 'image/png',
        dataBase64: TINY_PNG_BASE64,
      }),
    );

    expect(result).toEqual({ ok: false, reason: 'FORBIDDEN' });

    const content = await getPartnerContent(client, foreignContentId);
    expect(content.coverImage ?? []).toHaveLength(0);
  });
});
