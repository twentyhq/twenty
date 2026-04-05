import Exa from 'exa-js';

import { type WebSearchDriver } from 'src/engine/core-modules/web-search/drivers/interfaces/web-search-driver.interface';
import { type WebSearchOptions } from 'src/engine/core-modules/web-search/types/web-search-options.type';
import { type WebSearchResult } from 'src/engine/core-modules/web-search/types/web-search-result.type';

const MAX_RESULTS = 10;
const MAX_HIGHLIGHT_CHARACTERS = 4000;

// Exa charges $7/1k requests for auto search type
const EXA_COST_PER_QUERY_DOLLARS = 0.007;

export class ExaDriver implements WebSearchDriver {
  readonly costPerQueryDollars = EXA_COST_PER_QUERY_DOLLARS;

  private readonly client: Exa;

  constructor(apiKey: string) {
    this.client = new Exa(apiKey);
  }

  async search(
    query: string,
    options?: WebSearchOptions,
  ): Promise<WebSearchResult[]> {
    const response = await this.client.search(query, {
      type: 'auto',
      numResults: MAX_RESULTS,
      category: options?.category,
      contents: {
        highlights: { maxCharacters: MAX_HIGHLIGHT_CHARACTERS },
      },
    });

    return response.results.map((result) => ({
      title: result.title ?? '',
      url: result.url,
      snippet:
        result.highlights?.join('\n') ?? result.text?.slice(0, 500) ?? '',
    }));
  }
}
