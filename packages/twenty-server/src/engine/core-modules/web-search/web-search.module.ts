import { type DynamicModule, Global } from '@nestjs/common';

import { WebSearchDriverFactory } from 'src/engine/core-modules/web-search/web-search-driver.factory';
import { WebSearchService } from 'src/engine/core-modules/web-search/web-search.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Global()
export class WebSearchModule {
  static forRoot(): DynamicModule {
    return {
      module: WebSearchModule,
      imports: [TwentyConfigModule],
      providers: [WebSearchDriverFactory, WebSearchService],
      exports: [WebSearchService],
    };
  }
}
