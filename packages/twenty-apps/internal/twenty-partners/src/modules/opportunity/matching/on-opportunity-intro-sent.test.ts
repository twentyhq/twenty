import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutationMock } = vi.hoisted(() => ({
  mutationMock: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { mutation: mutationMock };
  }),
}));

import { handler } from './on-opportunity-intro-sent.logic-function';

const OPP = 'aaaaaaaa-0000-0000-0000-000000000001';

const event = (after: Record<string, unknown>, updatedFields: string[]) =>
  ({ properties: { after, updatedFields } }) as never;

describe('on-opportunity-intro-sent', () => {
  beforeEach(() => {
    mutationMock.mockReset();
    mutationMock.mockResolvedValue({ updateOpportunity: { id: OPP } });
  });

  it('sets isListed to false when introSentAt goes from empty to a date', async () => {
    const result = await handler(
      event({ id: OPP, introSentAt: '2026-08-19T00:00:00.000Z' }, [
        'introSentAt',
      ]),
    );
    expect(mutationMock).toHaveBeenCalledWith({
      updateOpportunity: {
        __args: { id: OPP, data: { isListed: false } },
        id: true,
      },
    });
    expect(result).toEqual({ unlisted: true, opportunityId: OPP });
  });

  it('writes nothing when introSentAt is cleared', async () => {
    const result = await handler(
      event({ id: OPP, introSentAt: null }, ['introSentAt']),
    );
    expect(mutationMock).not.toHaveBeenCalled();
    expect(result).toEqual({ skipped: true, reason: 'intro_sent_at_cleared' });
  });

  it('returns without writing when the payload carries no record id', async () => {
    const result = await handler(
      event({ introSentAt: '2026-08-19T00:00:00.000Z' }, ['introSentAt']),
    );
    expect(mutationMock).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });
});
