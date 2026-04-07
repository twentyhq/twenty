import {
  type WebSearchCostModel,
  type WebSearchDriver,
} from 'src/engine/core-modules/web-search/drivers/interfaces/web-search-driver.interface';
import { type WebSearchResult } from 'src/engine/core-modules/web-search/types/web-search-result.type';

export class DisabledWebSearchDriver implements WebSearchDriver {
  readonly costModel: WebSearchCostModel = {
    baseResultCount: 0,
    baseCostDollars: 0,
    costPerAdditionalResultDollars: 0,
  };

  constructor(private readonly reason: string) {}

  async search(): Promise<WebSearchResult[]> {
    throw new Error(this.reason);
  }
}
