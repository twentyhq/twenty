import { describe, expect, it } from 'vitest';

import { getFirefliesBackfillFeedback } from 'src/front-components/utils/get-fireflies-backfill-feedback.util';

describe('getFirefliesBackfillFeedback', () => {
  it.each([
    ['started', 'success'],
    ['invalid-request', 'error'],
    ['not-configured', 'error'],
  ])('maps the %s outcome to a %s feedback', (outcome, variant) => {
    expect(getFirefliesBackfillFeedback(outcome).variant).toBe(variant);
  });

  it('maps an unknown outcome to an error feedback', () => {
    expect(getFirefliesBackfillFeedback('unexpected')).toEqual({
      variant: 'error',
      message: 'Could not start the backfill. Try again later.',
    });
  });

  it('maps a missing outcome to an error feedback', () => {
    expect(getFirefliesBackfillFeedback(undefined).variant).toBe('error');
  });
});
