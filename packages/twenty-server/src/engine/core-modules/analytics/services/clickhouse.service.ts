import { Injectable } from '@nestjs/common';

import { ClickHouseClient, createClient } from '@clickhouse/client';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { AnalyticsPageview } from 'src/engine/core-modules/analytics/types/pageview.type';
import { AnalyticsEvent } from 'src/engine/core-modules/analytics/types/event.type';

@Injectable()
export class ClickhouseService {
  private clickhouseClient: ClickHouseClient | undefined;

  constructor(private readonly environmentService: EnvironmentService) {
    if (environmentService.get('ANALYTICS_ENABLED')) {
      this.clickhouseClient = createClient({
        url: environmentService.get('CLICKHOUSE_URL'),
        database: environmentService.get('CLICKHOUSE_DB'),
      });
    }
  }

  async insert(data: AnalyticsPageview | AnalyticsEvent) {
    try {
      if (!this.clickhouseClient) {
        return { success: true };
      }

      await this.clickhouseClient.insert({
        table: 'action' in data ? 'events' : 'pageview',
        values: {
          ...data,
          ...('payload' in data
            ? { payload: JSON.stringify(data.payload) }
            : {}),
        },
        format: 'JSONEachRow',
      });

      return { success: true };
    } catch (err) {
      return { success: false };
    }
  }
}
