// Deferred: written for the batch pass, not run as part of this task.
// resolvePartnerFromRequest only base64-decodes the bearer token (no signature
// check), so a fake unsigned JWT is enough to drive the handler against a real
// workspace member — same trick as resolve-partner-from-request.test.ts.
import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { handler } from 'src/logic-functions/submit-partner-content-for-review.logic-function';

const makeToken = (payload: Record<string, unknown>): string =>
  `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.sig`;

const requireId = (id: string | undefined, what: string): string => {
  if (id === undefined) throw new Error(`${what} did not return an id`);
  return id;
};

describe('submit-partner-content-for-review handler', () => {
  let client: CoreApiClient;
  let partnerId: string;
  let otherPartnerId: string;
  let userWorkspaceId: string;
  let wipId: string;
  let approvedId: string;
  let otherWipId: string;
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
          data: { name: 'Submit-For-Review Integration Test Partner', partnerUserId: member.id },
        },
        id: true,
      },
    });
    partnerId = requireId(partnerCreated.createPartner?.id, 'createPartner');

    const otherPartnerCreated = await client.mutation({
      createPartner: {
        __args: { data: { name: 'Other Partner (submit-for-review test)' } },
        id: true,
      },
    });
    otherPartnerId = requireId(otherPartnerCreated.createPartner?.id, 'createPartner');

    const wip = await client.mutation({
      createPartnerContent: {
        __args: {
          data: {
            partnerId,
            name: 'WIP case study',
            contentType: ['CASE_STUDY'],
            status: 'WIP',
          },
        },
        id: true,
      },
    });
    wipId = requireId(wip.createPartnerContent?.id, 'createPartnerContent');

    const approved = await client.mutation({
      createPartnerContent: {
        __args: {
          data: {
            partnerId,
            name: 'Already approved case study',
            contentType: ['CASE_STUDY'],
            status: 'APPROVED',
          },
        },
        id: true,
      },
    });
    approvedId = requireId(approved.createPartnerContent?.id, 'createPartnerContent');

    const otherWip = await client.mutation({
      createPartnerContent: {
        __args: {
          data: {
            partnerId: otherPartnerId,
            name: 'Belongs to someone else (WIP)',
            contentType: ['CASE_STUDY'],
            status: 'WIP',
          },
        },
        id: true,
      },
    });
    otherWipId = requireId(otherWip.createPartnerContent?.id, 'createPartnerContent');
  });

  afterAll(async () => {
    if (originalToken === undefined) delete process.env.TWENTY_APP_ACCESS_TOKEN;
    else process.env.TWENTY_APP_ACCESS_TOKEN = originalToken;

    // Guard each id: if beforeAll threw partway through, the unset ones stay undefined —
    // skip them so cleanup still reaches every record that was actually created.
    for (const id of [wipId, approvedId, otherWipId]) {
      if (id) await client.mutation({ destroyPartnerContent: { __args: { id }, id: true } });
    }
    for (const id of [partnerId, otherPartnerId]) {
      if (id) await client.mutation({ destroyPartner: { __args: { id }, id: true } });
    }
  });

  const callHandler = (recordId: string) =>
    handler({
      headers: {},
      queryStringParameters: {},
      pathParameters: {},
      body: { recordId },
      isBase64Encoded: false,
      requestContext: {
        http: { method: 'POST', path: '/submit-partner-content-for-review' },
      },
      userWorkspaceId,
    });

  it('flips a WIP row to UNDER_CUSTOMER_PARTNER_REVIEW', async () => {
    const result = await callHandler(wipId);

    expect(result).toEqual({ ok: true, status: 'UNDER_CUSTOMER_PARTNER_REVIEW' });

    const fetched = await client.query({
      partnerContents: {
        __args: { filter: { id: { eq: wipId } }, first: 1 },
        edges: { node: { status: true } },
      },
    });
    expect(fetched.partnerContents?.edges?.[0]?.node?.status).toBe(
      'UNDER_CUSTOMER_PARTNER_REVIEW',
    );
  });

  it('refuses a non-WIP row', async () => {
    const result = await callHandler(approvedId);
    expect(result).toEqual({ ok: false, reason: 'NOT_SUBMITTABLE' });
  });

  it('refuses a row owned by another partner', async () => {
    const result = await callHandler(otherWipId);
    expect(result).toEqual({ ok: false, reason: 'FORBIDDEN' });
  });
});
