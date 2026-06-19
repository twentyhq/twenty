import Exa from 'exa-js';
import { chargeCredits } from 'twenty-sdk/billing';
import { defineLogicFunction } from 'twenty-sdk/define';

import { DEFAULT_NUM_RESULTS } from './constants/default-num-results.constant';
import { exaWebSearchInputSchema } from './schemas/exa-web-search-input.schema';
import { type ExaWebSearchInput } from './types/exa-web-search-input.type';

// Number of sentences surfaced per result — keeps the snippet compact
// enough for an LLM to read many results without blowing the context.
const HIGHLIGHT_NUM_SENTENCES = 5;

// Inner bound — the runtime's `timeoutSeconds: 30` is the outer kill
// switch; this one ensures we return a clean error on a slow Exa response.
const EXA_SEARCH_TIMEOUT_MS = 25_000;

// Exa auto-search pricing (2025): $0.007 covers the first 10 results,
// $0.001 per additional result. Twenty charges in micro-credits where
// 1 USD = 1_000_000 micro-credits (DOLLAR_TO_CREDIT_MULTIPLIER).
const MICRO_CREDITS_PER_DOLLAR = 1_000_000;
const EXA_BASE_COST_DOLLARS = 0.007;
const EXA_COST_PER_ADDITIONAL_RESULT_DOLLARS = 0.001;

type ExaSearchResult = {
  title: string;
  url: string;
  snippet: string;
};

type HandlerResult = {
  success: boolean;
  message: string;
  result?: ExaSearchResult[];
  error?: string;
};

const computeMicroCredits = (numResults: number): number => {
  const additional = Math.max(0, numResults - DEFAULT_NUM_RESULTS);
  const dollars =
    EXA_BASE_COST_DOLLARS + additional * EXA_COST_PER_ADDITIONAL_RESULT_DOLLARS;

  return Math.round(dollars * MICRO_CREDITS_PER_DOLLAR);
};

const handler = async (
  parameters: ExaWebSearchInput,
): Promise<HandlerResult> => {
  const apiKey = process.env.EXA_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      message: 'Exa is not configured',
      error:
        'EXA_API_KEY is not set. The server admin must provide an Exa API key for this tool to work.',
    };
  }

  const query = parameters.query;
  const numResults = parameters.numResults ?? DEFAULT_NUM_RESULTS;
  const category = parameters.category;

  try {
    const exa = new Exa(apiKey);

    // exa-js has no built-in abort — race it manually.
    const response = await Promise.race([
      exa.searchAndContents(query, {
        type: 'auto',
        numResults,
        category,
        highlights: { numSentences: HIGHLIGHT_NUM_SENTENCES },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Exa search timed out')),
          EXA_SEARCH_TIMEOUT_MS,
        ),
      ),
    ]);

    const results: ExaSearchResult[] = response.results.map((result) => ({
      title: result.title ?? '',
      url: result.url,
      snippet: result.highlights?.join('\n') ?? '',
    }));

    await chargeCredits({
      creditsUsedMicro: computeMicroCredits(results.length),
      operationType: 'WEB_SEARCH',
      resourceContext: 'exa',
    });

    return {
      success: true,
      message: `Found ${results.length} results for "${query}"${category ? ` (category: ${category})` : ''}`,
      result: results,
    };
  } catch (error) {
    return {
      success: false,
      message: `Web search failed for "${query}"`,
      error: error instanceof Error ? error.message : 'Web search failed',
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: '4c6f9b2a-5d8e-4c2a-af18-3e0b9c6a7e4f',
  name: 'exa_web_search',
  description:
    'Structured web search powered by Exa. Returns entity-aware results with category filtering (companies, people, research papers, news, and other content types). Prefer this when the query benefits from structured data or a specific category. For general real-time web browsing, prefer the native `web_search` tool when it is available.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: exaWebSearchInputSchema,
  },
  handler,
});
