import { Injectable } from '@nestjs/common';

import { type WebSearchDriver } from 'src/engine/core-modules/web-search/drivers/interfaces/web-search-driver.interface';
import { type WebSearchBillingContext } from 'src/engine/core-modules/web-search/types/web-search-billing-context.type';
import { type WebSearchOptions } from 'src/engine/core-modules/web-search/types/web-search-options.type';
import { type WebSearchResult } from 'src/engine/core-modules/web-search/types/web-search-result.type';
import { WebSearchDriverFactory } from 'src/engine/core-modules/web-search/web-search-driver.factory';
import { WebSearchDriverType } from 'src/engine/core-modules/web-search/web-search.interface';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { DOLLAR_TO_CREDIT_MULTIPLIER } from 'src/engine/metadata-modules/ai/ai-billing/constants/dollar-to-credit-multiplier';

@Injectable()
export class WebSearchService {
  constructor(
    private readonly webSearchDriverFactory: WebSearchDriverFactory,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  isEnabled(): boolean {
    return (
      this.twentyConfigService.get('WEB_SEARCH_DRIVER') !==
      WebSearchDriverType.DISABLED
    );
  }

  async search(
    query: string,
    options?: WebSearchOptions,
    billingContext?: WebSearchBillingContext,
  ): Promise<WebSearchResult[]> {
    const driver = this.webSearchDriverFactory.getCurrentDriver();
    const results = await driver.search(query, options);

    if (billingContext) {
      this.emitUsageEvent(driver, billingContext);
    }

    return results;
  }

  private emitUsageEvent(
    driver: WebSearchDriver,
    billingContext: WebSearchBillingContext,
  ): void {
    const creditsUsedMicro = Math.round(
      driver.costPerQueryDollars * DOLLAR_TO_CREDIT_MULTIPLIER,
    );

    this.workspaceEventEmitter.emitCustomBatchEvent<UsageEvent>(
      USAGE_RECORDED,
      [
        {
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.WEB_SEARCH,
          creditsUsedMicro,
          quantity: 1,
          unit: UsageUnit.INVOCATION,
          resourceContext: this.twentyConfigService.get('WEB_SEARCH_DRIVER'),
          userWorkspaceId: billingContext.userWorkspaceId ?? null,
        },
      ],
      billingContext.workspaceId,
    );
  }
}
