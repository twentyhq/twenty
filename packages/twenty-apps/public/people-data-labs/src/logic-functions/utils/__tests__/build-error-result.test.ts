import { describe, expect, it } from 'vitest';

import { buildErrorResult } from 'src/logic-functions/utils/build-error-result';

describe('buildErrorResult', () => {
  it('builds an ERROR result carrying the error detail', () => {
    expect(buildErrorResult({ recordId: 'p1', error: 'boom' })).toEqual({
      success: false,
      recordId: 'p1',
      status: 'ERROR',
      updatedFields: [],
      message: 'People Data Labs enrichment failed.',
      error: 'boom',
    });
  });
});
