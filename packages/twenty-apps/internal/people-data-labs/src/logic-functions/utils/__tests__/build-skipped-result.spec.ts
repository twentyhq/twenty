import { describe, expect, it } from 'vitest';

import { buildSkippedResult } from 'src/logic-functions/utils/build-skipped-result';

describe('buildSkippedResult', () => {
  it('builds a successful skipped result with no updated fields', () => {
    expect(buildSkippedResult('record-1', 'no identifier')).toEqual({
      success: true,
      recordId: 'record-1',
      status: 'SKIPPED',
      updatedFields: [],
      message: 'no identifier',
    });
  });
});
