import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { ApplicationKeyValueStoreQuotaExceededError } from 'src/engine/core-modules/application/key-value-store/errors/application-key-value-store-quota-exceeded.error';

type Scope = {
  applicationId: string;
  workspaceId: string;
};

// Redis-backed key-value store handed to logic functions so they can cache
// intermediate results across executions. Entries are scoped per application
// per workspace and the total stored size is capped (see the
// APPLICATION_KEY_VALUE_STORAGE_MAX_SIZE_IN_BYTES config variable).
@Injectable()
export class ApplicationKeyValueStoreService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineApplicationKeyValue)
    private readonly cacheStorageService: CacheStorageService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async get(scope: Scope, key: string): Promise<{ value: string } | null> {
    const value = await this.cacheStorageService.getString(
      this.getEntryKey(scope, key),
    );

    return value === null ? null : { value };
  }

  async set(
    scope: Scope,
    key: string,
    value: string,
    ttlInSeconds?: number,
  ): Promise<void> {
    const maxSizeInBytes = this.twentyConfigService.get(
      'APPLICATION_KEY_VALUE_STORAGE_MAX_SIZE_IN_BYTES',
    );

    const entryKey = this.getEntryKey(scope, key);
    const newEntrySize = Buffer.byteLength(value, 'utf8');

    const [currentTotalSize, existingEntrySize] = await Promise.all([
      this.cacheStorageService.scanAndSumStringLengths(
        `${this.getScopePrefix(scope)}*`,
      ),
      this.cacheStorageService.getStringLength(entryKey),
    ]);

    const projectedTotalSize =
      currentTotalSize - existingEntrySize + newEntrySize;

    if (projectedTotalSize > maxSizeInBytes) {
      throw new ApplicationKeyValueStoreQuotaExceededError(maxSizeInBytes);
    }

    await this.cacheStorageService.setString(
      entryKey,
      value,
      ttlInSeconds ? ttlInSeconds * 1000 : undefined,
    );
  }

  async delete(scope: Scope, key: string): Promise<void> {
    await this.cacheStorageService.del(this.getEntryKey(scope, key));
  }

  private getScopePrefix({ workspaceId, applicationId }: Scope): string {
    return `${workspaceId}:${applicationId}:`;
  }

  private getEntryKey(scope: Scope, key: string): string {
    return `${this.getScopePrefix(scope)}${key}`;
  }
}
