import { Injectable } from '@nestjs/common';

import { ClickHouseClient, createClient } from '@clickhouse/client';
import { Pageview, Event } from 'twenty-analytics';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
@Injectable()
export class ClickhouseService {
  private clickhouseClient: ClickHouseClient;

  constructor(private readonly environmentService: EnvironmentService) {
    this.clickhouseClient = createClient({
      url: environmentService.get('CLICKHOUSE_URL'),
      database: environmentService.get('CLICKHOUSE_DB'),
    });
  }

  async insert(data: Pageview | Event) {
    try {
      const table = 'action' in data ? 'events' : 'pageview';

      await this.clickhouseClient.insert({
        table,
        values: data,
        format: 'JSONEachRow',
      });

      return { success: true };
    } catch (err) {
      console.log('>>>>>>>>>>>>>>', err);

      return { success: false };
    }
  }

  async onModuleDestroy() {
    await this.clickhouseClient.close();
  }
}
