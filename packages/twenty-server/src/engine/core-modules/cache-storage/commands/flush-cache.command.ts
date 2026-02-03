import { CACHE_MANAGER, type Cache } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const NAMESPACE_VALUES = Object.values(
  CacheStorageNamespace,
) as CacheStorageNamespace[];

@Command({
  name: 'cache:flush',
  description:
    'Flush cache Redis (REDIS_URL) for a namespace and pattern. Omit --namespace to flush all namespaces. Run: npx nx run twenty-server:command cache:flush',
})
export class FlushCacheCommand extends CommandRunner {
  private readonly logger = new Logger(FlushCacheCommand.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    super();
  }

  async run(
    _passedParams: string[],
    options?: Record<string, string>,
  ): Promise<void> {
    try {
      const namespaceArg = options?.namespace;
      const namespacesToFlush =
        this.computeNamespacesToFlushOrThrow(namespaceArg);
      const pattern = options?.pattern ?? '*';

      this.logger.log(
        namespacesToFlush.length === 1
          ? `Flushing namespace ${namespacesToFlush[0]} for pattern: ${pattern}...`
          : `Flushing all namespaces for pattern: ${pattern}...`,
      );

      for (const namespace of namespacesToFlush) {
        const cacheStorage = new CacheStorageService(
          this.cacheManager,
          namespace,
        );

        await cacheStorage.flushByPattern(pattern);
      }

      this.logger.log('Cache flushed');
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  private computeNamespacesToFlushOrThrow(
    value: unknown,
  ): CacheStorageNamespace[] {
    if (!isDefined(value)) {
      return NAMESPACE_VALUES;
    }

    if (!isNonEmptyString(value)) {
      throw new Error(
        `Invalid --namespace: ${value}. Valid values: ${NAMESPACE_VALUES.join(', ')}`,
      );
    }

    return [this.parseNamespaceOrThrow(value)];
  }

  private parseNamespaceOrThrow(value: string): CacheStorageNamespace {
    if (!NAMESPACE_VALUES.includes(value as CacheStorageNamespace)) {
      throw new Error(
        `Invalid --namespace: ${value}. Valid values: ${NAMESPACE_VALUES.join(', ')}`,
      );
    }

    return value as CacheStorageNamespace;
  }

  @Option({
    flags: '-n, --namespace <namespace>',
    description: `Cache namespace to flush. Omit to flush all. One of: ${NAMESPACE_VALUES.join(', ')}`,
  })
  parseNamespaceOption(val: string): string {
    return val;
  }

  @Option({
    flags: '-p, --pattern <pattern>',
    description:
      'Pattern within the namespace (default *). Keys matched are <namespace>:<pattern>.',
  })
  parsePattern(val: string): string {
    return val;
  }
}
