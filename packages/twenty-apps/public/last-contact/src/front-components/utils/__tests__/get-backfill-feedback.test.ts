import { describe, expect, it } from 'vitest';

import { BACKFILL_STARTED_OUTCOME } from 'src/constants/backfill';
import { getBackfillFeedback } from 'src/front-components/utils/get-backfill-feedback.util';

describe('getBackfillFeedback', () => {
  it('reports success for a started backfill', () => {
    expect(getBackfillFeedback(BACKFILL_STARTED_OUTCOME).variant).toBe(
      'success',
    );
  });

  it('reports an error for an unknown outcome', () => {
    expect(getBackfillFeedback('something-else').variant).toBe('error');
  });

  it('reports an error when the request returned no outcome', () => {
    expect(getBackfillFeedback(undefined).variant).toBe('error');
  });
});
