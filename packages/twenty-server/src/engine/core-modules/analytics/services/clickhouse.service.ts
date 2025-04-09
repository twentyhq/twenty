import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

import { ClickHouseClient, createClient } from '@clickhouse/client';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AnalyticsPageview } from 'src/engine/core-modules/analytics/types/pageview.type';
import { AnalyticsEvent } from 'src/engine/core-modules/analytics/types/event.type';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';

@Injectable()
export class ClickhouseService {
  private clickhouseClient: ClickHouseClient | undefined;
  private buffer: Array<AnalyticsPageview | AnalyticsEvent> = [];
  private readonly maxBufferSize: number;
  private readonly flushIntervalMs: number;
  private readonly intervalName = 'event-buffer-flush';
  private flushing = false;
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    if (twentyConfigService.get('ANALYTICS_ENABLED')) {
      this.maxBufferSize = 100;
      this.flushIntervalMs = twentyConfigService.get(
        'ANALYTICS_FLUSH_INTERVAL_MS',
      );
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

  onModuleInit() {
    if (this.twentyConfigService.get('ANALYTICS_ENABLED')) {
      const interval = setInterval(() => this.flush(), this.flushIntervalMs);

      this.schedulerRegistry.addInterval(this.intervalName, interval);
    }
  }

  onModuleDestroy() {
    this.flush(true);

    if (this.schedulerRegistry.doesExist('interval', this.intervalName)) {
      this.schedulerRegistry.deleteInterval(this.intervalName);
    }
  }

  async pushEvent(data: AnalyticsPageview | AnalyticsEvent) {
    try {
      this.buffer.push(data);

      if (this.buffer.length >= this.maxBufferSize) {
        await this.flush();
      }

      return { success: true };
    } catch (err) {
      this.exceptionHandlerService.captureExceptions([err]);

      return { success: false };
    }
  }

  private async bulkInsert(
    dataArray: Array<AnalyticsPageview | AnalyticsEvent>,
  ) {
    try {
      if (!this.clickhouseClient) {
        return { success: true };
      }

      const eventRecords: AnalyticsEvent[] = [];
      const pageviewRecords: AnalyticsPageview[] = [];

      for (const data of dataArray) {
        if ('action' in data) {
          eventRecords.push(data);
        } else {
          pageviewRecords.push(data);
        }
      }

      if (eventRecords.length > 0) {
        await this.clickhouseClient.insert({
          table: 'events',
          values: eventRecords.map((event) => ({
            ...event,
            payload: JSON.stringify(event.payload),
          })),
          format: 'JSONEachRow',
        });
      }

      if (pageviewRecords.length > 0) {
        await this.clickhouseClient.insert({
          table: 'pageview',
          values: pageviewRecords,
          format: 'JSONEachRow',
        });
      }

      return { success: true };
    } catch (err) {
      this.exceptionHandlerService.captureExceptions([err]);

      return { success: false };
    }
  }

  private async flush(force = false): Promise<void> {
    if ((this.buffer.length === 0 || this.flushing) && !force) {
      return;
    }

    const eventsToFlush = [...this.buffer];

    try {
      this.flushing = true;

      this.buffer = [];

      if (eventsToFlush.length > 0 || force) {
        await this.bulkInsert(eventsToFlush);
      }
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error]);

      if (this.buffer.length + eventsToFlush.length <= this.maxBufferSize * 2) {
        this.buffer.unshift(...eventsToFlush);
      }
    } finally {
      this.flushing = false;
    }
  }
}
