import { fetchArtificialAnalysisBenchmarks } from '../fetch-artificial-analysis';

const respondWith = (models: unknown[]): void => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: models }),
  }) as unknown as typeof fetch;
};

const measuredModel = {
  slug: 'claude-sonnet-5',
  evaluations: { artificial_analysis_intelligence_index: 38.4 },
  median_output_tokens_per_second: 92.1,
  cost_per_task: { total_cost: 0.42 },
};

describe('fetchArtificialAnalysisBenchmarks', () => {
  it('reads the index, speed and cost per task for a measured model', async () => {
    respondWith([measuredModel]);

    const record = (await fetchArtificialAnalysisBenchmarks('key')).get(
      'claudesonnet5',
    );

    expect(record?.intelligenceIndex).toBe(38.4);
    expect(record?.outputTokensPerSecond).toBe(92.1);
    expect(record?.costPerTask).toBe(0.42);
  });

  it('treats zero as not measured rather than as a measurement', async () => {
    respondWith([
      {
        slug: 'grok-4-6',
        evaluations: { artificial_analysis_intelligence_index: 44.1 },
        median_output_tokens_per_second: 0,
      },
    ]);

    const record = (await fetchArtificialAnalysisBenchmarks('key')).get(
      'grok46',
    );

    expect(record?.intelligenceIndex).toBe(44.1);
    expect(record?.outputTokensPerSecond).toBeUndefined();
  });

  it('keeps the measured row when an unmeasured duplicate shares its name', async () => {
    respondWith([
      measuredModel,
      { slug: 'claude-sonnet-5', median_output_tokens_per_second: 0 },
    ]);

    const record = (await fetchArtificialAnalysisBenchmarks('key')).get(
      'claudesonnet5',
    );

    expect(record?.intelligenceIndex).toBe(38.4);
  });

  it('fails loudly when every row came back unmeasured', async () => {
    respondWith([
      { slug: 'claude-sonnet-5', median_output_tokens_per_second: 0 },
    ]);

    await expect(fetchArtificialAnalysisBenchmarks('key')).rejects.toThrow(
      /none carried a measurement/,
    );
  });

  it('ignores figures published at the top level instead of their container', async () => {
    respondWith([
      {
        slug: 'claude-sonnet-5',
        artificial_analysis_intelligence_index: 38.4,
        median_output_tokens_per_second: 92.1,
      },
    ]);

    const record = (await fetchArtificialAnalysisBenchmarks('key')).get(
      'claudesonnet5',
    );

    expect(record?.intelligenceIndex).toBeUndefined();
    expect(record?.outputTokensPerSecond).toBe(92.1);
  });
});
