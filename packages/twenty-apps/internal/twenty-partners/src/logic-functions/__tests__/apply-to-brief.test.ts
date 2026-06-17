import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
}));

import { handler } from '../apply-to-brief.logic-function';

const SECRET = 'test-secret-value';
const MEMBER_ID = 'aaaaaaaa-1111-1111-1111-111111111111';
const OPPORTUNITY_ID = 'bbbbbbbb-2222-2222-2222-222222222222';
const PARTNER_ID = 'cccccccc-3333-3333-3333-333333333333';
const APPLICATION_ID = 'dddddddd-4444-4444-4444-444444444444';

// Helper: build an HTTP-envelope event.
// Pass null as secret to omit the header entirely; omit the argument for the correct secret.
const httpEvent = (body: unknown, secret: string | null = SECRET) => ({
  headers:
    secret !== null ? { 'x-application-secret': secret } : {},
  body,
});

const validBody = {
  opportunityId: OPPORTUNITY_ID,
  applicantMemberId: MEMBER_ID,
  pitch: 'We are the best fit.',
};

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset();
  process.env.PARTNER_APPLICATION_SECRET = SECRET;
});

describe('apply-to-brief handler', () => {
  it('returns UNAUTHORIZED when x-application-secret header is missing', async () => {
    const result = await handler(httpEvent(validBody, null));
    expect(result).toEqual({ ok: false, reason: 'UNAUTHORIZED' });
    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('returns UNAUTHORIZED when x-application-secret header is wrong', async () => {
    const result = await handler(httpEvent(validBody, 'wrong-secret'));
    expect(result).toEqual({ ok: false, reason: 'UNAUTHORIZED' });
    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('returns NOT_A_PARTNER when the member maps to no Partner', async () => {
    // partners query returns empty edges
    queryMock.mockResolvedValueOnce({
      partners: { edges: [] },
    });

    const result = await handler(httpEvent(validBody));
    expect(result).toEqual({ ok: false, reason: 'NOT_A_PARTNER' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('returns { ok: true, already: true } when an Application already exists for (opportunity, partner)', async () => {
    // 1st call: partners query
    queryMock.mockResolvedValueOnce({
      partners: {
        edges: [{ node: { id: PARTNER_ID, name: 'Acme Partners' } }],
      },
    });
    // 2nd call: existing applications query — found
    queryMock.mockResolvedValueOnce({
      applications: {
        edges: [{ node: { id: APPLICATION_ID } }],
      },
    });

    const result = await handler(httpEvent(validBody));
    expect(result).toEqual({ ok: true, already: true, applicationId: APPLICATION_ID });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('calls createApplication with the correct payload on the happy path', async () => {
    // 1st call: partners query
    queryMock.mockResolvedValueOnce({
      partners: {
        edges: [{ node: { id: PARTNER_ID, name: 'Acme Partners' } }],
      },
    });
    // 2nd call: existing applications query — empty
    queryMock.mockResolvedValueOnce({
      applications: { edges: [] },
    });
    // 3rd call: opportunity query
    queryMock.mockResolvedValueOnce({
      opportunity: { id: OPPORTUNITY_ID, name: 'Scale CRM' },
    });

    mutationMock.mockResolvedValue({
      createApplication: { id: APPLICATION_ID },
    });

    const result = await handler(httpEvent(validBody));

    expect(result).toMatchObject({ ok: true, applicationId: APPLICATION_ID });

    expect(mutationMock).toHaveBeenCalledTimes(1);
    const call = mutationMock.mock.calls[0][0];
    const data = call.createApplication.__args.data;

    expect(data.name).toBe('Acme Partners · Scale CRM');
    expect(data.opportunityId).toBe(OPPORTUNITY_ID);
    expect(data.partnerId).toBe(PARTNER_ID);
    expect(data.partnerUserId).toBe(MEMBER_ID);
    expect(data.state).toBe('APPLIED');
    expect(typeof data.lastActivityAt).toBe('string');
    expect(data.pitch).toBe('We are the best fit.');
  });

  it('omits pitch when not provided', async () => {
    queryMock.mockResolvedValueOnce({
      partners: {
        edges: [{ node: { id: PARTNER_ID, name: 'Acme Partners' } }],
      },
    });
    queryMock.mockResolvedValueOnce({
      applications: { edges: [] },
    });
    queryMock.mockResolvedValueOnce({
      opportunity: { id: OPPORTUNITY_ID, name: 'Scale CRM' },
    });

    mutationMock.mockResolvedValue({
      createApplication: { id: APPLICATION_ID },
    });

    const bodyWithoutPitch = {
      opportunityId: OPPORTUNITY_ID,
      applicantMemberId: MEMBER_ID,
    };

    await handler(httpEvent(bodyWithoutPitch));

    const call = mutationMock.mock.calls[0][0];
    const data = call.createApplication.__args.data;
    expect('pitch' in data).toBe(false);
  });
});
