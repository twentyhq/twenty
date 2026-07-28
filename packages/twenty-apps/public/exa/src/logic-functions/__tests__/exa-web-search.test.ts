import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type ExaWebSearchInput } from '../types/exa-web-search-input.type';

const { exaConstructorMock, searchAndContentsMock, chargeCreditsMock } =
  vi.hoisted(() => ({
    exaConstructorMock: vi.fn(),
    searchAndContentsMock: vi.fn(),
    chargeCreditsMock: vi.fn(),
  }));

vi.mock('exa-js', () => ({
  default: vi.fn(function (apiKey: string) {
    exaConstructorMock(apiKey);

    return { searchAndContents: searchAndContentsMock };
  }),
}));

vi.mock('twenty-sdk/billing', () => ({
  chargeCredits: chargeCreditsMock,
}));

import exaWebSearch from '../exa-web-search';

type ExaWebSearchResult = {
  success: boolean;
  message: string;
  result?: { title: string; url: string; snippet: string }[];
  error?: string;
};

const handler = exaWebSearch.config.handler as (
  parameters: ExaWebSearchInput,
) => Promise<ExaWebSearchResult>;

const API_KEY = 'exa-test-key';

describe('exa_web_search handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EXA_API_KEY = API_KEY;
    chargeCreditsMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return a configuration error and skip the search when EXA_API_KEY is not set', async () => {
    delete process.env.EXA_API_KEY;

    const result = await handler({ query: 'twenty crm' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Exa is not configured');
    expect(result.error).toContain('EXA_API_KEY is not set');
    expect(exaConstructorMock).not.toHaveBeenCalled();
    expect(searchAndContentsMock).not.toHaveBeenCalled();
    expect(chargeCreditsMock).not.toHaveBeenCalled();
  });

  it('should map Exa results to title/url/snippet and report success', async () => {
    searchAndContentsMock.mockResolvedValue({
      results: [
        {
          title: 'Twenty CRM',
          url: 'https://twenty.com',
          highlights: ['Open-source CRM', 'Built with modern tech'],
        },
      ],
    });

    const result = await handler({ query: 'twenty crm' });

    expect(exaConstructorMock).toHaveBeenCalledWith(API_KEY);
    expect(result).toEqual({
      success: true,
      message: 'Found 1 results for "twenty crm"',
      result: [
        {
          title: 'Twenty CRM',
          url: 'https://twenty.com',
          snippet: 'Open-source CRM\nBuilt with modern tech',
        },
      ],
    });
  });

  it('should default to DEFAULT_NUM_RESULTS and search with type "auto" and highlights when numResults is omitted', async () => {
    searchAndContentsMock.mockResolvedValue({ results: [] });

    await handler({ query: 'acme corp', category: 'company' });

    expect(searchAndContentsMock).toHaveBeenCalledWith('acme corp', {
      type: 'auto',
      numResults: 10,
      category: 'company',
      highlights: { numSentences: 5 },
    });
  });

  it('should forward an explicit numResults to Exa', async () => {
    searchAndContentsMock.mockResolvedValue({ results: [] });

    await handler({ query: 'acme corp', numResults: 3 });

    expect(searchAndContentsMock).toHaveBeenCalledWith(
      'acme corp',
      expect.objectContaining({ numResults: 3 }),
    );
  });

  it('should include the category in the success message when one is provided', async () => {
    searchAndContentsMock.mockResolvedValue({
      results: [{ title: 'A', url: 'https://a.com', highlights: ['x'] }],
    });

    const result = await handler({ query: 'openai', category: 'company' });

    expect(result.message).toBe('Found 1 results for "openai" (category: company)');
  });

  it('should fall back to empty strings for a missing title and missing highlights', async () => {
    searchAndContentsMock.mockResolvedValue({
      results: [{ url: 'https://no-title.com' }],
    });

    const result = await handler({ query: 'edge case' });

    expect(result.result).toEqual([
      { title: '', url: 'https://no-title.com', snippet: '' },
    ]);
  });

  it('should charge the Exa base price (7000 micro-credits) for up to DEFAULT_NUM_RESULTS results', async () => {
    searchAndContentsMock.mockResolvedValue({
      results: [{ title: 'A', url: 'https://a.com', highlights: ['x'] }],
    });

    await handler({ query: 'pricing base' });

    expect(chargeCreditsMock).toHaveBeenCalledWith({
      creditsUsedMicro: 7000,
      operationType: 'WEB_SEARCH',
      resourceContext: 'exa',
    });
  });

  it('should add 1000 micro-credits per result beyond DEFAULT_NUM_RESULTS', async () => {
    searchAndContentsMock.mockResolvedValue({
      results: Array.from({ length: 12 }, (_, index) => ({
        title: `Result ${index}`,
        url: `https://example.com/${index}`,
        highlights: ['snippet'],
      })),
    });

    await handler({ query: 'pricing extra', numResults: 12 });

    expect(chargeCreditsMock).toHaveBeenCalledWith(
      expect.objectContaining({ creditsUsedMicro: 9000 }),
    );
  });

  it('should return a failure result and not charge credits when the Exa search throws', async () => {
    searchAndContentsMock.mockRejectedValue(new Error('Exa rate limit exceeded'));

    const result = await handler({ query: 'boom' });

    expect(result).toEqual({
      success: false,
      message: 'Web search failed for "boom"',
      error: 'Exa rate limit exceeded',
    });
    expect(chargeCreditsMock).not.toHaveBeenCalled();
  });

  it('should time out and fail when Exa does not respond within the inner timeout', async () => {
    vi.useFakeTimers();
    searchAndContentsMock.mockReturnValue(new Promise<never>(() => {}));

    const resultPromise = handler({ query: 'slow query' });
    await vi.advanceTimersByTimeAsync(25_000);
    const result = await resultPromise;

    expect(result).toEqual({
      success: false,
      message: 'Web search failed for "slow query"',
      error: 'Exa search timed out',
    });
    expect(chargeCreditsMock).not.toHaveBeenCalled();
  });
});
