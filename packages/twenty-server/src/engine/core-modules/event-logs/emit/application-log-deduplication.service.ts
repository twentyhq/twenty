import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { APPLICATION_LOG_DEDUPLICATION_WINDOW_MS } from 'src/engine/core-modules/event-logs/emit/constants/application-log-deduplication-window-ms.constant';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';

@Injectable()
export class ApplicationLogDeduplicationService {
  private readonly logger = new Logger(ApplicationLogDeduplicationService.name);

  constructor(
    private readonly eventLogEmitterService: EventLogEmitterService,
    @InjectCacheStorage(CacheStorageNamespace.EngineLock)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  recordOncePerWindow(entry: ApplicationLogEntry): void {
    if (!this.eventLogEmitterService.isEnabled()) {
      return;
    }

    void this.recordIfFirstInWindow(entry).catch((error) => {
      this.logger.error('Failed to record application log', error);
    });
  }

  private async recordIfFirstInWindow(
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
