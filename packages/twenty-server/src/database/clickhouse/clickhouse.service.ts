import { Injectable } from '@nestjs/common';

import { ClickHouseClient, createClient } from '@clickhouse/client';

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

  getClickhouseClient() {
    return this.clickhouseClient;
  }

  async query(sql: string) {
    return this.clickhouseClient
      .query({ query: sql, format: 'JSON' })
      .then((res) => res.json());
  }

  async insert(table: string, values: object[]) {
    return this.clickhouseClient.insert({
      table,
      values,
      format: 'JSONEachRow',
    });
  }

  async command(sql: string) {
    return this.clickhouseClient.command({ query: sql });
  }

  async onModuleDestroy() {
    await this.clickhouseClient.close();
  }
}
