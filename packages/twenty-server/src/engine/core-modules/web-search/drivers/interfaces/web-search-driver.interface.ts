import { type WebSearchOptions } from 'src/engine/core-modules/web-search/types/web-search-options.type';
import { type WebSearchResult } from 'src/engine/core-modules/web-search/types/web-search-result.type';

export interface WebSearchDriver {
  readonly costPerQueryDollars: number;

  search(query: string, options?: WebSearchOptions): Promise<WebSearchResult[]>;
}
