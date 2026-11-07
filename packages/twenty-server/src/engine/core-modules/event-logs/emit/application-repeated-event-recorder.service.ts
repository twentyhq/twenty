import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { APPLICATION_LOG_DEDUPLICATION_WINDOW_MS } from 'src/engine/core-modules/event-logs/emit/constants/application-log-deduplication-window-ms.constant';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { ApplicationMetricEventRollupBuffer } from 'src/engine/core-modules/event-logs/producers/application-metric-event/application-metric-event-rollup-buffer';
import { toApplicationMetricEvent } from 'src/engine/core-modules/event-logs/producers/application-metric-event/to-application-metric-event';

const METRIC_EVENT_FLUSH_INTERVAL_MS = 10_000;
const MAX_BUFFERED_METRIC_EVENTS = 10_000;

@Injectable()
export class ApplicationRepeatedEventRecorderService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(
    ApplicationRepeatedEventRecorderService.name,
  );
  private readonly metricEventRollupBuffer =
    new ApplicationMetricEventRollupBuffer(MAX_BUFFERED_METRIC_EVENTS);
  private flushTimer: NodeJS.Timeout | null = null;
  private pendingFlush: Promise<void> = Promise.resolve();
  private isFlushQueued = false;

  constructor(
    private readonly eventLogEmitterService: EventLogEmitterService,
    @InjectCacheStorage(CacheStorageNamespace.EngineLock)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  onModuleInit() {
    this.flushTimer = setInterval(
      () => void this.flushMetricEvents(),
      METRIC_EVENT_FLUSH_INTERVAL_MS,
    );

    this.flushTimer.unref();
  }

  async onModuleDestroy() {
    await this.flushAndStop();
  }

  async flushAndStop(): Promise<void> {
    if (isDefined(this.flushTimer)) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    await this.flushMetricEvents();
  }

  record({
    entry,
    occurrenceCount = 1,
  }: {
    entry: ApplicationLogEntry;
    occurrenceCount?: number;
  }): void {
    if (!this.eventLogEmitterService.isEnabled()) {
      return;
    }

    this.metricEventRollupBuffer.increment({
      ...toApplicationMetricEvent(entry),
      occurrenceCount,
    });

    if (this.metricEventRollupBuffer.isFull) {
      void this.flushMetricEvents();
    }

    this.recordLogIfFirstInWindow(entry).catch((error) => {
      this.logger.error(
        `Failed to record application log for application ${entry.applicationId} in workspace ${entry.workspaceId}`,
        error,
      );
    });
  }

  private flushMetricEvents(): Promise<void> {
    if (this.isFlushQueued) {
      return this.pendingFlush;
    }

    this.isFlushQueued = true;
    this.pendingFlush = this.pendingFlush.then(() =>
      this.drainAndRecordMetricEvents(),
    );

    return this.pendingFlush;
  }

  private async drainAndRecordMetricEvents(): Promise<void> {
    this.isFlushQueued = false;

    const metricEvents = this.metricEventRollupBuffer.drain();

    if (isNonEmptyArray(metricEvents)) {
      await this.eventLogEmitterService.recordApplicationMetricEvents(
        metricEvents,
      );
    }
  }

  private async recordLogIfFirstInWindow(
    entry: ApplicationLogEntry,
  ): Promise<void> {
    const ownerToken = await this.cacheStorageService.acquireLock({
      key: [
        'application-log-deduplication',
        entry.workspaceId,
        entry.applicationRegistrationId,
        entry.applicationId,
        entry.logicFunctionId,
        entry.source,
        entry.errorCode ?? '',
      ].join(':'),
      ttl: APPLICATION_LOG_DEDUPLICATION_WINDOW_MS,
    });

    if (isDefined(ownerToken)) {
      await this.eventLogEmitterService.recordApplicationLogs([entry]);
    }
  }
}
