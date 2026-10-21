import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

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

  constructor(
    private readonly eventLogEmitterService: EventLogEmitterService,
    @InjectCacheStorage(CacheStorageNamespace.EngineLock)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  onModuleInit() {
    this.flushTimer = setInterval(
      () => this.flushMetricEvents(),
      METRIC_EVENT_FLUSH_INTERVAL_MS,
    );

    this.flushTimer.unref();
  }

  onModuleDestroy() {
    if (isDefined(this.flushTimer)) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    this.flushMetricEvents();
  }

  record(entry: ApplicationLogEntry, occurrenceCount = 1): void {
    if (!this.eventLogEmitterService.isEnabled()) {
      return;
    }

    this.metricEventRollupBuffer.increment({
      ...toApplicationMetricEvent(entry),
      occurrenceCount,
    });

    if (this.metricEventRollupBuffer.isFull) {
      this.flushMetricEvents();
    }

    void this.recordLogIfFirstInWindow(entry).catch((error) => {
      this.logger.error('Failed to record application log', error);
    });
  }

  private flushMetricEvents(): void {
    const metricEvents = this.metricEventRollupBuffer.drain();

    if (metricEvents.length > 0) {
      this.eventLogEmitterService.recordApplicationMetricEvents(metricEvents);
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
        entry.source,
        entry.errorCode ?? '',
      ].join(':'),
      ttl: APPLICATION_LOG_DEDUPLICATION_WINDOW_MS,
    });

    if (isDefined(ownerToken)) {
      this.eventLogEmitterService.recordApplicationLogs([entry]);
    }
  }
}
