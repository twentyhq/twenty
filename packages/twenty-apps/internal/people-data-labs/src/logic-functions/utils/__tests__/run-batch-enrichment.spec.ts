import { describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { runBatchEnrichment } from 'src/logic-functions/utils/run-batch-enrichment';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';

type FakeNode = {
  id: string;
  lastEnrichedAt: string | null;
  hasIdentifier: boolean;
};
type FakeData = { id: string };
type FakeParams = { id: string };

type RecordConfig = {
  id: string;
  exists?: boolean;
  lastEnrichedAt?: string | null;
  hasIdentifier?: boolean;
  outcome?: PdlEnrichResult<FakeData>;
  updateFails?: boolean;
  buildFails?: boolean;
};

const CLIENT = {} as CoreApiClient;

const buildHarness = (configs: RecordConfig[]) => {
  const byId = new Map(configs.map((config) => [config.id, config]));

  const readRecords = vi.fn(
    async ({
      recordIds,
    }: {
      client: CoreApiClient;
      recordIds: string[];
    }): Promise<FakeNode[]> =>
      recordIds
        .map((id) => byId.get(id))
        .filter(
          (config): config is RecordConfig =>
            isPresent(config) && config.exists !== false,
        )
        .map((config) => ({
          id: config.id,
          lastEnrichedAt: config.lastEnrichedAt ?? null,
          hasIdentifier: config.hasIdentifier !== false,
        })),
  );

  const enrichBatch = vi.fn(
    async (params: FakeParams[]): Promise<PdlEnrichResult<FakeData>[]> =>
      params.map(
        (param) =>
          byId.get(param.id)?.outcome ?? {
            outcome: 'matched',
            httpStatus: 200,
            data: { id: param.id },
          },
      ),
  );

  const updateOne = vi.fn(
    async ({
      recordId,
    }: {
      client: CoreApiClient;
      recordId: string;
      data: Record<string, unknown>;
    }) => {
      if (byId.get(recordId)?.updateFails === true) {
        throw new Error('update failed');
      }
    },
  );

  const updateManyStatus = vi.fn(async () => undefined);

  const adapter: BatchEnrichmentAdapter<FakeNode, FakeData, FakeParams> = {
    objectNameSingular: 'Test',
    noIdentifierMessage: 'no identifier',
    readRecords,
    getNodeId: (node) => node.id,
    getLastEnrichedAt: (node) => node.lastEnrichedAt,
    extractParams: ({ node }) =>
      node.hasIdentifier ? { id: node.id } : undefined,
    enrichBatch,
    buildMatchedData: async ({ node }) => {
      if (byId.get(node.id)?.buildFails === true) {
        throw new Error('build failed');
      }

      return { value: node.id };
    },
    updateOne,
    updateManyStatus,
  };

  return { adapter, readRecords, enrichBatch, updateOne, updateManyStatus };
};

const isPresent = <TValue>(value: TValue | undefined): value is TValue =>
  value !== undefined;

const records = (...ids: string[]) => ids.map((id) => ({ id }));

describe('runBatchEnrichment', () => {
  it('reads every id in one call and enriches the set in one batch', async () => {
    const harness = buildHarness([{ id: 'a' }, { id: 'b' }]);

    const result = await runBatchEnrichment({
      client: CLIENT,
      input: { records: records('a', 'b') },
      adapter: harness.adapter,
    });

    expect(harness.readRecords).toHaveBeenCalledTimes(1);
    expect(harness.readRecords).toHaveBeenCalledWith({
      client: CLIENT,
      recordIds: ['a', 'b'],
    });
    expect(harness.enrichBatch).toHaveBeenCalledTimes(1);
    expect(harness.enrichBatch).toHaveBeenCalledWith([{ id: 'a' }, { id: 'b' }]);
    expect(harness.updateOne).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      total: 2,
      matched: 2,
      errored: 0,
      success: true,
    });
  });

  it('writes NOT_FOUND and ERROR statuses with batched status updates', async () => {
    const harness = buildHarness([
      { id: 'a', outcome: { outcome: 'not_found', httpStatus: 404 } },
      { id: 'b', outcome: { outcome: 'not_found', httpStatus: 404 } },
      { id: 'c', outcome: { outcome: 'error', httpStatus: 500, message: 'boom' } },
    ]);

    const result = await runBatchEnrichment({
      client: CLIENT,
      input: { records: records('a', 'b', 'c') },
      adapter: harness.adapter,
    });

    expect(harness.updateOne).not.toHaveBeenCalled();
    expect(harness.updateManyStatus).toHaveBeenCalledWith({
      client: CLIENT,
      recordIds: ['c'],
      data: {
        pdlEnrichmentStatus: 'ERROR',
        pdlLastEnrichedAt: expect.any(String),
      },
    });
    expect(harness.updateManyStatus).toHaveBeenCalledWith({
      client: CLIENT,
      recordIds: ['a', 'b'],
      data: {
        pdlEnrichmentStatus: 'NOT_FOUND',
        pdlLastEnrichedAt: expect.any(String),
      },
    });
    expect(result).toMatchObject({ notFound: 2, errored: 1, matched: 0 });
    expect(result.results.find((entry) => entry.recordId === 'c')?.error).toBe(
      'boom',
    );
  });

  it('skips recently-enriched and no-identifier records before the PDL call', async () => {
    const harness = buildHarness([
      { id: 'a', lastEnrichedAt: new Date().toISOString() },
      { id: 'b', hasIdentifier: false },
      { id: 'c' },
    ]);

    const result = await runBatchEnrichment({
      client: CLIENT,
      input: { records: records('a', 'b', 'c') },
      adapter: harness.adapter,
    });

    expect(harness.enrichBatch).toHaveBeenCalledWith([{ id: 'c' }]);
    expect(result).toMatchObject({ skipped: 2, matched: 1 });
  });

  it('re-enriches recently-enriched records when force is set', async () => {
    const harness = buildHarness([
      { id: 'a', lastEnrichedAt: new Date().toISOString() },
    ]);

    await runBatchEnrichment({
      client: CLIENT,
      input: { records: records('a'), force: true },
      adapter: harness.adapter,
    });

    expect(harness.enrichBatch).toHaveBeenCalledWith([{ id: 'a' }]);
  });

  it('marks missing records as ERROR without enriching them', async () => {
    const harness = buildHarness([{ id: 'a' }, { id: 'b', exists: false }]);

    const result = await runBatchEnrichment({
      client: CLIENT,
      input: { records: records('a', 'b') },
      adapter: harness.adapter,
    });

    expect(harness.enrichBatch).toHaveBeenCalledWith([{ id: 'a' }]);
    expect(result.results.find((entry) => entry.recordId === 'b')).toMatchObject({
      status: 'ERROR',
      error: 'Test b not found',
    });
    expect(result).toMatchObject({ matched: 1, errored: 1 });
  });

  it('isolates a per-record matched update failure', async () => {
    const harness = buildHarness([{ id: 'a' }, { id: 'b', updateFails: true }]);

    const result = await runBatchEnrichment({
      client: CLIENT,
      input: { records: records('a', 'b') },
      adapter: harness.adapter,
    });

    expect(
      result.results.find((entry) => entry.recordId === 'a')?.status,
    ).toBe('MATCHED');
    expect(result.results.find((entry) => entry.recordId === 'b')).toMatchObject({
      status: 'ERROR',
      error: 'update failed',
    });
    expect(harness.updateManyStatus).toHaveBeenCalledWith({
      client: CLIENT,
      recordIds: ['b'],
      data: {
        pdlEnrichmentStatus: 'ERROR',
        pdlLastEnrichedAt: expect.any(String),
      },
    });
  });

  it('marks all attempted records as ERROR and writes the status when the batch PDL call rejects', async () => {
    const harness = buildHarness([{ id: 'a' }, { id: 'b' }]);
    harness.enrichBatch.mockRejectedValueOnce(new Error('pdl down'));

    const result = await runBatchEnrichment({
      client: CLIENT,
      input: { records: records('a', 'b') },
      adapter: harness.adapter,
    });

    expect(result).toMatchObject({ errored: 2, matched: 0 });
    expect(result.results[0].error).toBe('pdl down');
    expect(harness.updateOne).not.toHaveBeenCalled();
    expect(harness.updateManyStatus).toHaveBeenCalledWith({
      client: CLIENT,
      recordIds: ['a', 'b'],
      data: {
        pdlEnrichmentStatus: 'ERROR',
        pdlLastEnrichedAt: expect.any(String),
      },
    });
  });

  it('isolates a record whose matched-data build throws', async () => {
    const harness = buildHarness([{ id: 'a' }, { id: 'b', buildFails: true }]);

    const result = await runBatchEnrichment({
      client: CLIENT,
      input: { records: records('a', 'b') },
      adapter: harness.adapter,
    });

    expect(
      result.results.find((entry) => entry.recordId === 'a')?.status,
    ).toBe('MATCHED');
    expect(result.results.find((entry) => entry.recordId === 'b')).toMatchObject({
      status: 'ERROR',
      error: 'build failed',
    });
    expect(harness.updateOne).toHaveBeenCalledTimes(1);
    expect(harness.updateManyStatus).toHaveBeenCalledWith({
      client: CLIENT,
      recordIds: ['b'],
      data: {
        pdlEnrichmentStatus: 'ERROR',
        pdlLastEnrichedAt: expect.any(String),
      },
    });
  });

  it('produces exactly one result per record with counts summing to the total', async () => {
    const harness = buildHarness([
      { id: 'matched' },
      { id: 'notfound', outcome: { outcome: 'not_found', httpStatus: 404 } },
      { id: 'errored', outcome: { outcome: 'error', httpStatus: 500, message: 'x' } },
      { id: 'skipped', hasIdentifier: false },
      { id: 'missing', exists: false },
    ]);

    const result = await runBatchEnrichment({
      client: CLIENT,
      input: {
        records: records('matched', 'notfound', 'errored', 'skipped', 'missing'),
      },
      adapter: harness.adapter,
    });

    const recordIds = result.results.map((entry) => entry.recordId);
    expect(new Set(recordIds).size).toBe(recordIds.length);
    expect(result.results).toHaveLength(result.total);
    expect(
      result.matched + result.notFound + result.skipped + result.errored,
    ).toBe(result.total);
    expect(result).toMatchObject({
      total: 5,
      matched: 1,
      notFound: 1,
      errored: 2,
      skipped: 1,
      success: false,
    });
  });

  it('deduplicates record ids', async () => {
    const harness = buildHarness([{ id: 'a' }]);

    const result = await runBatchEnrichment({
      client: CLIENT,
      input: { records: records('a', 'a') },
      adapter: harness.adapter,
    });

    expect(harness.enrichBatch).toHaveBeenCalledWith([{ id: 'a' }]);
    expect(result.total).toBe(1);
  });

  it('chunks large id sets into separate read and PDL calls', async () => {
    const ids = Array.from({ length: 150 }, (_unused, index) => `r${index}`);
    const harness = buildHarness(ids.map((id) => ({ id })));

    const result = await runBatchEnrichment({
      client: CLIENT,
      input: { records: ids.map((id) => ({ id })) },
      adapter: harness.adapter,
    });

    expect(harness.readRecords).toHaveBeenCalledTimes(2);
    expect(harness.enrichBatch).toHaveBeenCalledTimes(2);
    expect(result.matched).toBe(150);
  });

  it('returns an empty summary when there are no records', async () => {
    const harness = buildHarness([]);

    const result = await runBatchEnrichment({
      client: CLIENT,
      input: { records: [] },
      adapter: harness.adapter,
    });

    expect(harness.readRecords).not.toHaveBeenCalled();
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
