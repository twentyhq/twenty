import { type DynamicModule, Global } from '@nestjs/common';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WebSearchDriverFactory } from 'src/engine/core-modules/web-search/web-search-driver.factory';
import { WebSearchService } from 'src/engine/core-modules/web-search/web-search.service';

@Global()
export class WebSearchModule {
  static forRoot(): DynamicModule {
    return {
      module: WebSearchModule,
      imports: [TwentyConfigModule, BillingModule],
      providers: [WebSearchDriverFactory, WebSearchService],
      exports: [WebSearchService],
    };
  }
}
