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
  performance: { median_output_tokens_per_second: 92.1 },
  artificial_analysis_intelligence_index_cost: {
    cost_per_task: { total_cost: 0.42 },
  },
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
        performance: { median_output_tokens_per_second: 0 },
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
        performance: { median_output_tokens_per_second: 120 },
        artificial_analysis_intelligence_index_cost: {
          cost_per_task: { total_cost: 0.1 },
        },
      };
      const maxEffort = {
        slug: 'claude-sonnet-4-6',
        name: 'Claude Sonnet 4.6 (Adaptive Reasoning, Max Effort)',
        evaluations: { artificial_analysis_intelligence_index: 36.2 },
        performance: { median_output_tokens_per_second: 80 },
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
        performance: { median_output_tokens_per_second: 0 },
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
      {
        slug: 'claude-sonnet-5',
        performance: { median_output_tokens_per_second: 0 },
      },
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
        performance: { median_output_tokens_per_second: 92.1 },
      },
    ]);

    const record = (await fetchArtificialAnalysisBenchmarks('key')).get(
      'claudesonnet5',
    );

    expect(record?.intelligenceIndex).toBeUndefined();
    expect(record?.outputTokensPerSecond).toBe(92.1);
  });

  it('reads every page of the list before indexing', async () => {
    const pages = [
      {
        data: [measuredModel],
        pagination: { page: 1, has_more: true },
      },
      {
        data: [
          {
            slug: 'gpt-5-6-luna',
            evaluations: { artificial_analysis_intelligence_index: 37.5 },
          },
        ],
        pagination: { page: 2, has_more: false },
      },
    ];
    const fetchMock = jest.fn(async (url: URL) => ({
      ok: true,
      json: async () => pages[Number(url.searchParams.get('page')) - 1],
    }));

    global.fetch = fetchMock as unknown as typeof fetch;

    const index = await fetchArtificialAnalysisBenchmarks('key');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(index.get('claudesonnet5')?.intelligenceIndex).toBe(38.4);
    expect(index.get('gpt56luna')?.intelligenceIndex).toBe(37.5);
  });

  it('files a row under its effort as well as under the bare model name', async () => {
    respondWith([
      {
        slug: 'gpt-5-6-sol',
        name: 'GPT-5.6 Sol (max)',
        evaluations: { artificial_analysis_intelligence_index: 47.1 },
      },
      {
        slug: 'gpt-5-6-sol',
        name: 'GPT-5.6 Sol (low)',
        evaluations: { artificial_analysis_intelligence_index: 30.2 },
        artificial_analysis_intelligence_index_cost: {
          cost_per_task: { total_cost: 0.08 },
        },
      },
    ]);

    const index = await fetchArtificialAnalysisBenchmarks('key');

    // The bare key still carries the ceiling, so nothing a consumer reads today
    // changes.
    expect(index.get('gpt56sol')?.intelligenceIndex).toBe(47.1);
    expect(index.get('gpt56sol')?.effort).toBe('max');
    expect(index.get('gpt56sol@max')?.intelligenceIndex).toBe(47.1);
    expect(index.get('gpt56sol@low')?.intelligenceIndex).toBe(30.2);
    expect(index.get('gpt56sol@low')?.costPerTask).toBe(0.08);
    expect(index.get('gpt56sol@low')?.effort).toBe('low');
  });

  it('keeps the better-measured row when two rows share an effort', async () => {
    respondWith([
      {
        slug: 'grok-4-6',
        name: 'Grok 4.6 (high)',
        evaluations: { artificial_analysis_intelligence_index: 44.4 },
      },
      {
        slug: 'grok-4-6',
        name: 'Grok 4.6 (high)',
        evaluations: { artificial_analysis_intelligence_index: 44.4 },
        performance: { median_output_tokens_per_second: 71 },
      },
    ]);

    const index = await fetchArtificialAnalysisBenchmarks('key');

    expect(index.get('grok46@high')?.outputTokensPerSecond).toBe(71);
  });

  it('files a row naming no effort under the bare name only', async () => {
    respondWith([
      {
        slug: 'gemini-3-1-pro-preview',
        name: 'Gemini 3.1 Pro Preview',
        evaluations: { artificial_analysis_intelligence_index: 30.4 },
      },
    ]);

    const index = await fetchArtificialAnalysisBenchmarks('key');

    expect(index.get('gemini31propreview')?.effort).toBeUndefined();
    expect([...index.keys()].some((key) => key.includes('@'))).toBe(false);
  });
});
