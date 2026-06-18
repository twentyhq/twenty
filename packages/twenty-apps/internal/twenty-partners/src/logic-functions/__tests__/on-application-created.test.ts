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

import { handler } from '../on-application-created';

const MEMBER_ID = 'aaaaaaaa-1111-1111-1111-111111111111';
const PARTNER_ID = 'bbbbbbbb-2222-2222-2222-222222222222';
const APPLICATION_ID = 'cccccccc-3333-3333-3333-333333333333';

const event = (after: Record<string, unknown>) =>
  ({ properties: { after } }) as never;

describe('on-application-created', () => {
  beforeEach(() => {
    queryMock.mockReset();
    mutationMock.mockReset();
    mutationMock.mockResolvedValue({ updateApplication: { id: APPLICATION_ID } });
  });

  it('does nothing when partnerId is already set (admin path)', async () => {
    const result = await handler(
      event({ id: APPLICATION_ID, partnerId: PARTNER_ID }),
    );
    expect(result).toEqual({});
    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('does nothing when createdBy.workspaceMemberId is missing', async () => {
    const result = await handler(
      event({ id: APPLICATION_ID, createdBy: {} }),
    );
    expect(result).toEqual({});
    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('does nothing when the member maps to no Partner', async () => {
    queryMock.mockResolvedValue({ partners: { edges: [] } });

    const result = await handler(
      event({
        id: APPLICATION_ID,
        createdBy: { workspaceMemberId: MEMBER_ID },
      }),
    );
    expect(result).toEqual({});
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('updates application with partnerId on the happy path', async () => {
    queryMock.mockResolvedValue({
      partners: { edges: [{ node: { id: PARTNER_ID } }] },
    });

    const result = await handler(
      event({
        id: APPLICATION_ID,
        createdBy: { workspaceMemberId: MEMBER_ID },
      }),
    );

    expect(result).toEqual({ applied: true, partnerId: PARTNER_ID });
    expect(mutationMock).toHaveBeenCalledTimes(1);
    const call = mutationMock.mock.calls[0][0];
    const args = call.updateApplication.__args;
    expect(args.id).toBe(APPLICATION_ID);
    expect(args.data.partnerId).toBe(PARTNER_ID);
    expect(args.data.partnerUserId).toBe(MEMBER_ID);
    expect(args.data.state).toBe('APPLIED');
    expect(typeof args.data.lastActivityAt).toBe('string');
  });
});
