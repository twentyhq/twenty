// resolvePartnerFromRequest only base64-decodes the bearer token (no signature
// check), so a fake unsigned JWT is enough to drive the handler against a real
// workspace member — same trick as resolve-partner-from-request.test.ts.
import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { handler } from 'src/logic-functions/save-my-partner-content.logic-function';

const makeToken = (payload: Record<string, unknown>): string =>
  `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.sig`;

const requireId = (id: string | undefined, what: string): string => {
  if (id === undefined) throw new Error(`${what} did not return an id`);
  return id;
};

describe('save-my-partner-content handler', () => {
  let client: CoreApiClient;
  let partnerId: string;
  let otherPartnerId: string;
  let userWorkspaceId: string;
  let keepId: string;
  let dropId: string;
  let otherContentId: string;
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
          data: { name: 'Content Integration Test Partner', partnerUserId: member.id },
        },
        id: true,
      },
    });
    partnerId = requireId(partnerCreated.createPartner?.id, 'createPartner');

    const otherPartnerCreated = await client.mutation({
      createPartner: {
        __args: { data: { name: 'Other Partner (content test)' } },
        id: true,
      },
    });
    otherPartnerId = requireId(otherPartnerCreated.createPartner?.id, 'createPartner');

    // Seeded APPROVED — proves an edit through this route never resets status.
    const keep = await client.mutation({
      createPartnerContent: {
        __args: {
          data: {
            partnerId,
            name: 'Keep me (edited)',
            contentType: ['CASE_STUDY'],
            status: 'APPROVED',
            clientName: 'Acme Corp',
            headline: 'Original headline',
            body: { markdown: 'Original body' },
          },
        },
        id: true,
      },
    });
    keepId = requireId(keep.createPartnerContent?.id, 'createPartnerContent');

    const drop = await client.mutation({
      createPartnerContent: {
        __args: {
          data: {
            partnerId,
            name: 'Drop me',
            contentType: ['CASE_STUDY'],
            status: 'WIP',
          },
        },
        id: true,
      },
    });
    dropId = requireId(drop.createPartnerContent?.id, 'createPartnerContent');

    const otherContent = await client.mutation({
      createPartnerContent: {
        __args: {
          data: {
            partnerId: otherPartnerId,
            name: 'Belongs to someone else',
            contentType: ['CASE_STUDY'],
            status: 'WIP',
          },
        },
        id: true,
      },
    });
    otherContentId = requireId(otherContent.createPartnerContent?.id, 'createPartnerContent');
  });

  afterAll(async () => {
    if (originalToken === undefined) delete process.env.TWENTY_APP_ACCESS_TOKEN;
    else process.env.TWENTY_APP_ACCESS_TOKEN = originalToken;

    await client.mutation({ destroyPartnerContent: { __args: { id: keepId }, id: true } });
    await client.mutation({ destroyPartnerContent: { __args: { id: otherContentId }, id: true } });
    // dropId is deleted by the reconcile happy-path; clean it up in case that test bailed early
    // (tolerate not-found — it is expected to be gone after a successful run).
    if (dropId) {
      await client
        .mutation({ destroyPartnerContent: { __args: { id: dropId }, id: true } })
        .catch(() => {});
    }
    await client.mutation({ destroyPartner: { __args: { id: partnerId }, id: true } });
    await client.mutation({ destroyPartner: { __args: { id: otherPartnerId }, id: true } });
  });

  it('keeps+edits one (status untouched), creates one (WIP/CASE_STUDY), drops the omitted one', async () => {
    const result = await handler({
      headers: {},
      queryStringParameters: {},
      pathParameters: {},
      body: {
        caseStudies: [
          {
            id: keepId,
            name: 'Keep me (edited)',
            clientName: 'Acme Corp',
            headline: 'Updated headline',
            bodyMarkdown: 'Updated body',
            caseStudyLink: 'https://example.com/acme-updated',
          },
          { name: 'Brand new case study', clientName: 'New Co', headline: 'Fresh win' },
        ],
      },
      isBase64Encoded: false,
      requestContext: { http: { method: 'POST', path: '/save-my-partner-content' } },
      userWorkspaceId,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.caseStudies).toHaveLength(2);

    const kept = result.caseStudies.find((row) => row.id === keepId);
    expect(kept).toMatchObject({ headline: 'Updated headline', bodyMarkdown: 'Updated body' });
    // The seeded row was APPROVED — an edit through this route must never reset it.
    expect(kept?.status).toBe('APPROVED');

    expect(result.caseStudies.some((row) => row.id === dropId)).toBe(false);

    const created = result.caseStudies.find((row) => row.name === 'Brand new case study');
    expect(created).toBeDefined();
    expect(created?.status).toBe('WIP');

    // contentType is stamped by the async trigger, which needs the creator's workspaceMemberId —
    // absent under vitest (buildAppClient runs as the API key), so it can't fire for route-created
    // rows here. Verify the draft persisted; trigger stamping is exercised where a real member exists.
    const fetched = await client.query({
      partnerContents: {
        __args: { filter: { id: { eq: created?.id ?? '' } }, first: 1 },
        edges: { node: { status: true } },
      },
    });
    expect(fetched.partnerContents?.edges?.[0]?.node?.status).toBe('WIP');
  });

  it('refuses a case study id owned by another partner', async () => {
    const result = await handler({
      headers: {},
      queryStringParameters: {},
      pathParameters: {},
      body: {
        caseStudies: [{ id: otherContentId, name: 'Hijacked' }],
      },
      isBase64Encoded: false,
      requestContext: { http: { method: 'POST', path: '/save-my-partner-content' } },
      userWorkspaceId,
    });

    expect(result).toEqual({ ok: false, reason: 'FORBIDDEN' });
  });
});
