import { describe, expect, it } from 'vitest';

import { FIREFLIES_BACKFILL_MAX_WINDOW_DAYS } from 'src/logic-functions/constants/fireflies-backfill-max-window-days.constant';
import { firefliesBackfillRequestBodySchema } from 'src/logic-functions/schemas/fireflies-backfill-request-body.schema';

describe('firefliesBackfillRequestBodySchema', () => {
  it('accepts a days window', () => {
    expect(
      firefliesBackfillRequestBodySchema.safeParse({ days: 30 }).success,
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

  it('rejects a days window beyond the supported maximum', () => {
    expect(
      firefliesBackfillRequestBodySchema.safeParse({
        days: FIREFLIES_BACKFILL_MAX_WINDOW_DAYS + 1,
      }).success,
    ).toBe(false);
  });
});
