import { Injectable } from '@nestjs/common';

import { ClickHouseClient, createClient } from '@clickhouse/client';

import { AnalyticsPageview } from 'src/engine/core-modules/analytics/types/pageview.type';
import { AnalyticsEvent } from 'src/engine/core-modules/analytics/types/event.type';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class ClickhouseService {
  private clickhouseClient: ClickHouseClient | undefined;
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    if (twentyConfigService.get('ANALYTICS_ENABLED')) {
      this.clickhouseClient = createClient({
        url: twentyConfigService.get('CLICKHOUSE_URL'),
        compression: {
          response: true,
          request: true,
        },
        clickhouse_settings: {
          async_insert: 1,
          wait_for_async_insert: 1,
        },
      });
    }
  }

  async pushEvent(data: AnalyticsPageview | AnalyticsEvent) {
    try {
      if (!this.clickhouseClient) {
        return { success: true };
      }

      if ('action' in data) {
        await this.clickhouseClient.insert({
          table: 'events',
          values: [
            {
              ...data,
              payload: JSON.stringify(data.payload),
            },
          ],
          format: 'JSONEachRow',
        });
      } else {
        await this.clickhouseClient.insert({
          table: 'pageview',
          values: [data],
          format: 'JSONEachRow',
        });
      }

      return { success: true };
    } catch (err) {
      this.exceptionHandlerService.captureExceptions([err]);

      return { success: false };
    }
  }
}
