import { fetchArtificialAnalysisBenchmarks } from '../utils/fetch-artificial-analysis-benchmarks.util';

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

  it.each([
    ['best row first', true],
    ['best row last', false],
  ])(
    'keeps the highest-scoring configuration whatever the order (%s)',
    async (_label, bestFirst) => {
      // The rows for one model are the same model at different reasoning
      // efforts. Picking by how populated a row is scored Sonnet 4.6 at low
      // effort against Sonnet 5 at max, and the gap read as capability.
      const lowEffort = {
        slug: 'claude-sonnet-4-6',
        name: 'Claude Sonnet 4.6 (Non-reasoning, Low Effort)',
        evaluations: { artificial_analysis_intelligence_index: 23.3 },
        median_output_tokens_per_second: 120,
        cost_per_task: { total_cost: 0.1 },
      };
      const maxEffort = {
        slug: 'claude-sonnet-4-6',
        name: 'Claude Sonnet 4.6 (Adaptive Reasoning, Max Effort)',
        evaluations: { artificial_analysis_intelligence_index: 36.2 },
        median_output_tokens_per_second: 80,
      };

      respondWith(bestFirst ? [maxEffort, lowEffort] : [lowEffort, maxEffort]);

      const record = (await fetchArtificialAnalysisBenchmarks('key')).get(
        'claudesonnet46',
      );

      expect(record?.intelligenceIndex).toBe(36.2);
      // The whole row travels together, so speed and cost describe the same
      // configuration the index was measured in.
      expect(record?.outputTokensPerSecond).toBe(80);
      expect(record?.costPerTask).toBeUndefined();
    },
  );

  it.each([
    ['unmeasured row first', true],
    ['measured row first', false],
  ])(
    'keeps the measured row when an unmeasured duplicate shares its name (%s)',
    async (_label, unmeasuredFirst) => {
      const unmeasured = {
        slug: 'claude-sonnet-5',
        median_output_tokens_per_second: 0,
      };

      respondWith(
        unmeasuredFirst
          ? [unmeasured, measuredModel]
          : [measuredModel, unmeasured],
      );

      const record = (await fetchArtificialAnalysisBenchmarks('key')).get(
        'claudesonnet5',
      );

      expect(record?.intelligenceIndex).toBe(38.4);
    },
  );

  it('survives a null row rather than discarding the whole response', async () => {
    respondWith([null, measuredModel]);

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
