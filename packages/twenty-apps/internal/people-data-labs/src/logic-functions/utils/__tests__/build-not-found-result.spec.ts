import { describe, expect, it } from 'vitest';

import { buildNotFoundResult } from 'src/logic-functions/utils/build-not-found-result';

describe('buildNotFoundResult', () => {
  it('builds a NOT_FOUND result', () => {
    expect(buildNotFoundResult('p1')).toEqual({
      success: true,
      recordId: 'p1',
      status: 'NOT_FOUND',
      updatedFields: [],
      message: 'People Data Labs returned no confident match.',
    });
  });
});
