// Deferred: written for the batch pass, not run as part of this task.
// resolvePartnerFromRequest only base64-decodes the bearer token (no signature
// check), so a fake unsigned JWT is enough to drive the handler against a real
// workspace member — same trick as resolve-partner-from-request.test.ts.
import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { handler } from 'src/logic-functions/save-my-partner-links.logic-function';

const makeToken = (payload: Record<string, unknown>): string =>
  `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.sig`;

const requireId = (id: string | undefined, what: string): string => {
  if (id === undefined) throw new Error(`${what} did not return an id`);
  return id;
};

describe('save-my-partner-links handler', () => {
  let client: CoreApiClient;
  let partnerId: string;
  let otherPartnerId: string;
  let userWorkspaceId: string;
  let keepId: string;
  let dropId: string;
  let otherLinkId: string;
  const originalToken = process.env.TWENTY_APP_ACCESS_TOKEN;

  beforeAll(async () => {
    client = new CoreApiClient();

    const memberResult = await client.query({
      workspaceMembers: {
        __args: { filter: { userId: { is: 'NOT_NULL' } }, first: 1 },
        edges: { node: { id: true, userId: true } },
      },
    });
    const member = memberResult.workspaceMembers?.edges?.[0]?.node;
    if (!member?.userId) {
      throw new Error('No workspace member with a linked userId found to drive this test.');
    }
    userWorkspaceId = 'integration-test-workspace';
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({
      userId: member.userId,
      userWorkspaceId,
    });

    const partnerCreated = await client.mutation({
      createPartner: {
        __args: {
          data: { name: 'Links Integration Test Partner', partnerUserId: member.id },
        },
        id: true,
      },
    });
    partnerId = requireId(partnerCreated.createPartner?.id, 'createPartner');

    const otherPartnerCreated = await client.mutation({
      createPartner: {
        __args: { data: { name: 'Other Partner (links test)' } },
        id: true,
      },
    });
    otherPartnerId = requireId(otherPartnerCreated.createPartner?.id, 'createPartner');

    const keep = await client.mutation({
      createPartnerLink: {
        __args: {
          data: {
            partnerId,
            name: 'Keep me (edited)',
            url: { primaryLinkUrl: 'https://example.com/keep' },
            sortOrder: 0,
          },
        },
        id: true,
      },
    });
    keepId = requireId(keep.createPartnerLink?.id, 'createPartnerLink');

    const drop = await client.mutation({
      createPartnerLink: {
        __args: {
          data: {
            partnerId,
            name: 'Drop me',
            url: { primaryLinkUrl: 'https://example.com/drop' },
            sortOrder: 1,
          },
        },
        id: true,
      },
    });
    dropId = requireId(drop.createPartnerLink?.id, 'createPartnerLink');

    const otherLink = await client.mutation({
      createPartnerLink: {
        __args: {
          data: {
            partnerId: otherPartnerId,
            name: 'Belongs to someone else',
            url: { primaryLinkUrl: 'https://example.com/other' },
            sortOrder: 0,
          },
        },
        id: true,
      },
    });
    otherLinkId = requireId(otherLink.createPartnerLink?.id, 'createPartnerLink');
  });

  afterAll(async () => {
    if (originalToken === undefined) delete process.env.TWENTY_APP_ACCESS_TOKEN;
    else process.env.TWENTY_APP_ACCESS_TOKEN = originalToken;

    await client.mutation({ destroyPartnerLink: { __args: { id: keepId }, id: true } });
    await client.mutation({ destroyPartnerLink: { __args: { id: otherLinkId }, id: true } });
    await client.mutation({ destroyPartner: { __args: { id: partnerId }, id: true } });
    await client.mutation({ destroyPartner: { __args: { id: otherPartnerId }, id: true } });
  });

  it('keeps+edits one, creates one, and drops the omitted one', async () => {
    const result = await handler({
      headers: {},
      queryStringParameters: {},
      pathParameters: {},
      body: {
        links: [
          { id: keepId, name: 'Keep me (edited)', url: 'https://example.com/keep-2', sortOrder: 0 },
          { name: 'Brand new link', url: 'https://example.com/new', sortOrder: 1 },
        ],
      },
      isBase64Encoded: false,
      requestContext: { http: { method: 'POST', path: '/save-my-partner-links' } },
      userWorkspaceId,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.links).toHaveLength(2);
    const kept = result.links.find((link) => link.id === keepId);
    expect(kept).toMatchObject({ name: 'Keep me (edited)', url: 'https://example.com/keep-2' });
    expect(result.links.some((link) => link.id === dropId)).toBe(false);
    expect(result.links.some((link) => link.name === 'Brand new link')).toBe(true);
  });

  it('refuses a link id owned by another partner', async () => {
    const result = await handler({
      headers: {},
      queryStringParameters: {},
      pathParameters: {},
      body: {
        links: [{ id: otherLinkId, name: 'Hijacked', url: 'https://example.com/hijack' }],
      },
      isBase64Encoded: false,
      requestContext: { http: { method: 'POST', path: '/save-my-partner-links' } },
      userWorkspaceId,
    });

    expect(result).toEqual({ ok: false, reason: 'FORBIDDEN' });
  });
});
