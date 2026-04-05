import Exa from 'exa-js';

import {
  type WebSearchCostModel,
  type WebSearchDriver,
} from 'src/engine/core-modules/web-search/drivers/interfaces/web-search-driver.interface';
import { type WebSearchOptions } from 'src/engine/core-modules/web-search/types/web-search-options.type';
import { type WebSearchResult } from 'src/engine/core-modules/web-search/types/web-search-result.type';

const DEFAULT_NUM_RESULTS = 10;
const MAX_HIGHLIGHT_CHARACTERS = 4000;

// Exa charges $7/1k requests for auto search type (up to 10 results)
// Additional results above 10 cost $1/1k = $0.001 each
const EXA_BASE_COST_DOLLARS = 0.007;
const EXA_COST_PER_ADDITIONAL_RESULT_DOLLARS = 0.001;

export class ExaDriver implements WebSearchDriver {
  readonly costModel: WebSearchCostModel = {
    baseResultCount: DEFAULT_NUM_RESULTS,
    baseCostDollars: EXA_BASE_COST_DOLLARS,
    costPerAdditionalResultDollars: EXA_COST_PER_ADDITIONAL_RESULT_DOLLARS,
  };

  private readonly client: Exa;

  constructor(apiKey: string) {
    this.client = new Exa(apiKey);
  }

  async search(
    query: string,
    options?: WebSearchOptions,
  ): Promise<WebSearchResult[]> {
    const numResults = options?.numResults ?? DEFAULT_NUM_RESULTS;

    const response = await this.client.search(query, {
      type: 'auto',
      numResults,
      category: options?.category,
      contents: {
        highlights: { maxCharacters: MAX_HIGHLIGHT_CHARACTERS },
      },
    });

    return response.results.map((result) => ({
      title: result.title ?? '',
      url: result.url,
      snippet: result.highlights?.join('\n') ?? '',
    }));
  }
}
