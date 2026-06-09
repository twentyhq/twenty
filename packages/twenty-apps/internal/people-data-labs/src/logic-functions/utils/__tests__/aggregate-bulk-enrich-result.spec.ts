import { describe, expect, it } from 'vitest';

import { aggregateBulkEnrichResult } from 'src/logic-functions/utils/aggregate-bulk-enrich-result';
import { type EnrichResult } from 'src/types/enrich-result';

const result = (status: EnrichResult['status'], recordId: string): EnrichResult => ({
  success: status !== 'ERROR',
  recordId,
  status,
  updatedFields: [],
  message: 'message',
});

describe('aggregateBulkEnrichResult', () => {
  it('counts each status and flags failure when something errored', () => {
    expect(
      aggregateBulkEnrichResult([
        result('MATCHED', 'a'),
        result('NOT_FOUND', 'b'),
        result('SKIPPED', 'c'),
        result('ERROR', 'd'),
      ]),
    ).toMatchObject({
      total: 4,
      matched: 1,
      notFound: 1,
      skipped: 1,
      errored: 1,
      success: false,
    });
  });

  it('reports success when there are no errors', () => {
    expect(aggregateBulkEnrichResult([result('MATCHED', 'a')])).toMatchObject({
      success: true,
      errored: 0,
      total: 1,
    });
  });

  it('returns an empty summary for no results', () => {
    expect(aggregateBulkEnrichResult([])).toEqual({
      success: true,
      total: 0,
      matched: 0,
      notFound: 0,
      skipped: 0,
      errored: 0,
      results: [],
    });
  });
});
