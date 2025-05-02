import { Injectable } from '@nestjs/common';

import { ClickHouseClient, createClient } from '@clickhouse/client';

import {
  makePageview,
  makeTrackEvent,
} from 'src/engine/core-modules/analytics/utils/analytics.utils';
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

  async pushEvent(
    data: (
      | ReturnType<typeof makeTrackEvent>
      | ReturnType<typeof makePageview>
    ) & { userId?: string | null; workspaceId?: string | null },
  ) {
    try {
      if (!this.clickhouseClient) {
        return { success: true };
      }

      const { type, ...rest } = data;

      await this.clickhouseClient.insert({
        table: type === 'page' ? 'pageview' : 'event',
        values: [rest],
        format: 'JSONEachRow',
      });

      return { success: true };
    } catch (err) {
      this.exceptionHandlerService.captureExceptions([err]);

      return { success: false };
    }
  }
}
