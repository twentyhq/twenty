// Deferred: written for the batch pass, not run as part of this task.
// resolvePartnerFromRequest only base64-decodes the bearer token (no signature
// check), so a fake unsigned JWT is enough to drive the handler against a real
// workspace member — same trick as resolve-partner-from-request.test.ts.
import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { handler } from 'src/logic-functions/save-my-partner-services.logic-function';

const makeToken = (payload: Record<string, unknown>): string =>
  `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.sig`;

const requireId = (id: string | undefined, what: string): string => {
  if (id === undefined) throw new Error(`${what} did not return an id`);
  return id;
};

describe('save-my-partner-services handler', () => {
  let client: CoreApiClient;
  let partnerId: string;
  let otherPartnerId: string;
  let userWorkspaceId: string;
  let keepId: string;
  let dropId: string;
  let otherServiceId: string;
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
          data: { name: 'Services Integration Test Partner', partnerUserId: member.id },
        },
        id: true,
      },
    });
    partnerId = requireId(partnerCreated.createPartner?.id, 'createPartner');

    const otherPartnerCreated = await client.mutation({
      createPartner: {
        __args: { data: { name: 'Other Partner (services test)' } },
        id: true,
      },
    });
    otherPartnerId = requireId(otherPartnerCreated.createPartner?.id, 'createPartner');

    const keep = await client.mutation({
      createPartnerService: {
        __args: {
          data: {
            partnerId,
            title: 'Keep me (edited)',
            description: 'Original description',
            sortOrder: 0,
          },
        },
        id: true,
      },
    });
    keepId = requireId(keep.createPartnerService?.id, 'createPartnerService');

    const drop = await client.mutation({
      createPartnerService: {
        __args: {
          data: {
            partnerId,
            title: 'Drop me',
            description: 'Will be removed',
            sortOrder: 1,
          },
        },
        id: true,
      },
    });
    dropId = requireId(drop.createPartnerService?.id, 'createPartnerService');

    const otherService = await client.mutation({
      createPartnerService: {
        __args: {
          data: {
            partnerId: otherPartnerId,
            title: 'Belongs to someone else',
            description: 'Not owned by the caller',
            sortOrder: 0,
          },
        },
        id: true,
      },
    });
    otherServiceId = requireId(otherService.createPartnerService?.id, 'createPartnerService');
  });

  afterAll(async () => {
    if (originalToken === undefined) delete process.env.TWENTY_APP_ACCESS_TOKEN;
    else process.env.TWENTY_APP_ACCESS_TOKEN = originalToken;

    await client.mutation({ destroyPartnerService: { __args: { id: keepId }, id: true } });
    await client.mutation({ destroyPartnerService: { __args: { id: otherServiceId }, id: true } });
    await client.mutation({ destroyPartner: { __args: { id: partnerId }, id: true } });
    await client.mutation({ destroyPartner: { __args: { id: otherPartnerId }, id: true } });
  });

  it('keeps+edits one, creates one, and drops the omitted one', async () => {
    const result = await handler({
      headers: {},
      queryStringParameters: {},
      pathParameters: {},
      body: {
        services: [
          {
            id: keepId,
            title: 'Keep me (edited)',
            description: 'Updated description',
            sortOrder: 0,
          },
          { title: 'Brand new service', description: 'Freshly added', sortOrder: 1 },
        ],
      },
      isBase64Encoded: false,
      requestContext: { http: { method: 'POST', path: '/save-my-partner-services' } },
      userWorkspaceId,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.services).toHaveLength(2);
    const kept = result.services.find((service) => service.id === keepId);
    expect(kept).toMatchObject({ title: 'Keep me (edited)', description: 'Updated description' });
    expect(result.services.some((service) => service.id === dropId)).toBe(false);
    expect(result.services.some((service) => service.title === 'Brand new service')).toBe(true);
  });

  it('refuses a service id owned by another partner', async () => {
    const result = await handler({
      headers: {},
      queryStringParameters: {},
      pathParameters: {},
      body: {
        services: [
          { id: otherServiceId, title: 'Hijacked', description: 'Should be refused' },
        ],
      },
      isBase64Encoded: false,
      requestContext: { http: { method: 'POST', path: '/save-my-partner-services' } },
      userWorkspaceId,
    });

    expect(result).toEqual({ ok: false, reason: 'FORBIDDEN' });
  });
});
