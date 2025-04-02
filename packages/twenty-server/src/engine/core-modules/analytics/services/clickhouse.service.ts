import { Injectable } from '@nestjs/common';

import { ClickHouseClient } from '@clickhouse/client';
import { Pageview, Event } from 'twenty-analytics';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
@Injectable()
export class ClickhouseService {
  private clickhouseClient: ClickHouseClient;

  constructor(private readonly environmentService: EnvironmentService) {
    // this.clickhouseClient = createClient({
    //   url: environmentService.get('CLICKHOUSE_URL'),
    //   database: environmentService.get('CLICKHOUSE_DB'),
    // });
  }

  async insert(data: Pageview | Event) {
    try {
      await this.clickhouseClient.insert({
        table: 'action' in data ? 'events' : 'pageview',
        values: data,
        format: 'JSONEachRow',
      });

      return { success: true };
    } catch (err) {
      return { success: false };
    }
  }
}
