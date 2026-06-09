import { describe, expect, it } from 'vitest';

import { buildMatchedResult } from 'src/logic-functions/utils/build-matched-result';

describe('buildMatchedResult', () => {
  it('builds a MATCHED result summarizing the written fields', () => {
    expect(
      buildMatchedResult({ recordId: 'p1', updatedFields: ['name', 'jobTitle'] }),
    ).toEqual({
      success: true,
      recordId: 'p1',
      status: 'MATCHED',
      updatedFields: ['name', 'jobTitle'],
      message: 'Enriched with People Data Labs (2 fields).',
    });
  });
});
