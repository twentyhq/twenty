import { describe, expect, it, vi } from 'vitest';

import { runBulkEnrichment } from 'src/logic-functions/utils/run-bulk-enrichment';
import { type EnrichResult } from 'src/types/enrich-result.type';

const matched = (recordId: string): EnrichResult => ({
  success: true,
  recordId,
  status: 'MATCHED',
  updatedFields: ['name'],
  message: 'Enriched.',
});

const notFound = (recordId: string): EnrichResult => ({
  success: true,
  recordId,
  status: 'NOT_FOUND',
  updatedFields: [],
  message: 'No match.',
});

describe('runBulkEnrichment', () => {
  it('enriches every record id and aggregates the outcomes', async () => {
    const enrichRecord = vi.fn(async (recordId: string) =>
      recordId === 'b' ? notFound(recordId) : matched(recordId),
    );

    const result = await runBulkEnrichment({
      input: { records: [{ id: 'a' }, { id: 'b' }] },
      enrichRecord,
    });

    expect(enrichRecord).toHaveBeenCalledTimes(2);
    expect(enrichRecord).toHaveBeenCalledWith('a');
    expect(enrichRecord).toHaveBeenCalledWith('b');
    expect(result).toEqual({
      success: true,
      total: 2,
      matched: 1,
      notFound: 1,
      skipped: 0,
      errored: 0,
      results: [matched('a'), notFound('b')],
    });
  });

  it('captures a per-record failure as an ERROR result without aborting the batch', async () => {
    const enrichRecord = vi.fn(async (recordId: string) => {
      if (recordId === 'a') {
        throw new Error('boom');
      }
      return matched(recordId);
    });

    const result = await runBulkEnrichment({
      input: { records: [{ id: 'a' }, { id: 'b' }] },
      enrichRecord,
    });

    expect(result.total).toBe(2);
    expect(result.matched).toBe(1);
    expect(result.errored).toBe(1);
    expect(result.success).toBe(false);
    expect(result.results[0]).toEqual({
      success: false,
      recordId: 'a',
      status: 'ERROR',
      updatedFields: [],
      message: 'People Data Labs enrichment failed.',
      error: 'boom',
    });
  });

  it('returns an empty summary when there are no records', async () => {
    const enrichRecord = vi.fn();

    const result = await runBulkEnrichment({ input: { records: [] }, enrichRecord });

    expect(enrichRecord).not.toHaveBeenCalled();
    expect(result).toEqual({
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
