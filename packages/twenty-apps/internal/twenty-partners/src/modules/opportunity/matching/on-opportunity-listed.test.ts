import { beforeEach, describe, expect, it, vi } from 'vitest';

const { notifyMock } = vi.hoisted(() => ({ notifyMock: vi.fn() }));
vi.mock(
  'src/modules/opportunity/matching/services/notify-listed-brief.service',
  () => ({
    notifyListedBrief: notifyMock,
  }),
);

import { handler } from './on-opportunity-listed.logic-function';

const OPP = 'aaaaaaaa-0000-0000-0000-000000000001';

const event = (
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  updatedFields: string[] = ['isListed'],
) => ({ properties: { before, after, updatedFields } }) as never;

describe('on-opportunity-listed', () => {
  beforeEach(() => {
    notifyMock.mockReset();
    notifyMock.mockResolvedValue(true);
  });

  it('notifies when isListed flips from false to true', async () => {
    const result = await handler(
      event({ id: OPP, isListed: false }, { id: OPP, isListed: true }),
    );
    expect(notifyMock).toHaveBeenCalledWith(OPP);
    expect(result).toEqual({ notified: true, opportunityId: OPP });
  });

  it('reports notified: false when the ping did not go out', async () => {
    notifyMock.mockResolvedValue(false);
    const result = await handler(
      event({ id: OPP, isListed: false }, { id: OPP, isListed: true }),
    );
    expect(result).toEqual({ notified: false, opportunityId: OPP });
  });

  it('stays silent when isListed flips to false', async () => {
    const result = await handler(
      event({ id: OPP, isListed: true }, { id: OPP, isListed: false }),
    );
    expect(notifyMock).not.toHaveBeenCalled();
    expect(result).toEqual({ skipped: true, reason: 'not_a_listing_flip' });
  });

  it('stays silent when isListed was already true', async () => {
    const result = await handler(
      event({ id: OPP, isListed: true }, { id: OPP, isListed: true }),
    );
    expect(notifyMock).not.toHaveBeenCalled();
    expect(result).toEqual({ skipped: true, reason: 'not_a_listing_flip' });
  });

  it('returns without notifying when the payload carries no record id', async () => {
    const result = await handler(
      event({ isListed: false }, { isListed: true }),
    );
    expect(notifyMock).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it('returns without notifying when isListed is not in updatedFields', async () => {
    const result = await handler(
      event({ id: OPP, isListed: true }, { id: OPP, isListed: true }, [
        'stage',
      ]),
    );
    expect(notifyMock).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });
});
