import { describe, expect, it } from 'vitest';

import { firefliesBackfillRequestBodySchema } from 'src/logic-functions/schemas/fireflies-backfill-request-body.schema';

describe('firefliesBackfillRequestBodySchema', () => {
  it('accepts a days window for an initial backfill', () => {
    expect(
      firefliesBackfillRequestBodySchema.safeParse({ days: 30 }).success,
    ).toBe(true);
  });

  it('accepts a continuation cursor', () => {
    expect(
      firefliesBackfillRequestBodySchema.safeParse({
        cursor: {
          fromDate: '2026-05-01T00:00:00.000Z',
          toDate: '2026-07-30T00:00:00.000Z',
          skip: 50,
        },
      }).success,
    ).toBe(true);
  });

  it('rejects an empty request body', () => {
    expect(firefliesBackfillRequestBodySchema.safeParse(null).success).toBe(
      false,
    );
  });

  it('rejects a non-positive days window', () => {
    expect(
      firefliesBackfillRequestBodySchema.safeParse({ days: 0 }).success,
    ).toBe(false);
  });

  it('rejects a fractional days window', () => {
    expect(
      firefliesBackfillRequestBodySchema.safeParse({ days: 1.5 }).success,
    ).toBe(false);
  });
});
