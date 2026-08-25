import { beforeEach, describe, expect, it, vi } from 'vitest';

const { preReviewPartnerMock } = vi.hoisted(() => ({
  preReviewPartnerMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return {};
  }),
}));

vi.mock(
  'src/modules/partner/pre-review/services/pre-review-partner.service',
  () => ({ preReviewPartner: preReviewPartnerMock }),
);

import { handler } from '../pre-review-partner.logic-function';

const PARTNER_ID = '11111111-1111-1111-1111-111111111111';

// The database event 'after' hydrates the actor composite as a NESTED object
// (after.createdBy.source), confirmed from the live partner.created payload.
const createdEvent = (source: string) =>
  ({ properties: { after: { id: PARTNER_ID, createdBy: { source } } } }) as never;

beforeEach(() => {
  preReviewPartnerMock.mockReset();
  preReviewPartnerMock.mockResolvedValue({ graded: true, verdict: 'STRONG' });
});

describe('pre-review-partner handler', () => {
  it('grades an APPLICATION-sourced partner', async () => {
    const result = await handler(createdEvent('APPLICATION'));

    expect(preReviewPartnerMock).toHaveBeenCalledTimes(1);
    expect(preReviewPartnerMock).toHaveBeenCalledWith(
      expect.anything(),
      PARTNER_ID,
    );
    expect(result).toEqual({ graded: true, verdict: 'STRONG' });
  });

  it('does not grade API-sourced creation (seed/import)', async () => {
    const result = await handler(createdEvent('API'));

    expect(preReviewPartnerMock).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it('does not grade MANUAL-sourced creation (operator-entered)', async () => {
    const result = await handler(createdEvent('MANUAL'));

    expect(preReviewPartnerMock).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });
});
