import { Injectable } from '@nestjs/common';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { INBOUND_WEBHOOK_IDEMPOTENCY_TTL_MS } from 'src/engine/core-modules/inbound-webhook/inbound-webhook.constants';
import { type InboundWebhookSource } from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-source.type';

@Injectable()
export class InboundWebhookIdempotencyService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineLock)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  // Returns true if the event was claimed (first time seen) — caller should
  // process. Returns false if a prior call already claimed it within the
  // TTL — caller should drop as duplicate.
  async claim({
    source,
    externalEventId,
  }: {
    source: InboundWebhookSource;
    externalEventId: string;
  }): Promise<boolean> {
    return this.cacheStorageService.acquireLock(
      this.buildKey({ source, externalEventId }),
      INBOUND_WEBHOOK_IDEMPOTENCY_TTL_MS,
    );
  }

  private buildKey({
    source,
    externalEventId,
  }: {
    source: InboundWebhookSource;
    externalEventId: string;
  }): string {
    return `inbound-webhook:idempotency:${source}:${externalEventId}`;
  }
}
