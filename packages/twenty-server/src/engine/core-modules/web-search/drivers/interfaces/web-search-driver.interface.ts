import { type WebSearchOptions } from 'src/engine/core-modules/web-search/types/web-search-options.type';
import { type WebSearchResult } from 'src/engine/core-modules/web-search/types/web-search-result.type';

export type WebSearchCostModel = {
  baseResultCount: number;
  baseCostDollars: number;
  costPerAdditionalResultDollars: number;
};

export interface WebSearchDriver {
  readonly costModel: WebSearchCostModel;

  search(query: string, options?: WebSearchOptions): Promise<WebSearchResult[]>;
}
