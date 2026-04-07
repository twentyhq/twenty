import { Injectable } from '@nestjs/common';

import { type WebSearchDriver } from 'src/engine/core-modules/web-search/drivers/interfaces/web-search-driver.interface';

import { DisabledWebSearchDriver } from 'src/engine/core-modules/web-search/drivers/disabled.driver';
import { ExaDriver } from 'src/engine/core-modules/web-search/drivers/exa.driver';
import { WebSearchDriverType } from 'src/engine/core-modules/web-search/web-search.interface';
import { DriverFactoryBase } from 'src/engine/core-modules/twenty-config/dynamic-factory.base';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class WebSearchDriverFactory extends DriverFactoryBase<WebSearchDriver> {
  constructor(twentyConfigService: TwentyConfigService) {
    super(twentyConfigService);
  }

  protected buildConfigKey(): string {
    const driverType = this.twentyConfigService.get('WEB_SEARCH_DRIVER');

    if (driverType !== WebSearchDriverType.DISABLED) {
      return `${driverType}|${this.getConfigGroupHash(ConfigVariablesGroup.LLM)}`;
    }

    return driverType;
  }

  protected createDriver(): WebSearchDriver {
    const driverType = this.twentyConfigService.get('WEB_SEARCH_DRIVER');

    switch (driverType) {
      case WebSearchDriverType.DISABLED:
        return new DisabledWebSearchDriver(
          'Web search is disabled. Set WEB_SEARCH_DRIVER to EXA and provide EXA_API_KEY to enable it.',
        );

      case WebSearchDriverType.EXA: {
        const apiKey = this.twentyConfigService.get('EXA_API_KEY');

        if (!apiKey) {
          throw new Error(
            'EXA_API_KEY is required when WEB_SEARCH_DRIVER is EXA',
          );
        }

        return new ExaDriver(apiKey);
      }

      default:
        throw new Error(
          `Invalid web search driver type (${driverType}), check your .env file`,
        );
    }
  }
}
