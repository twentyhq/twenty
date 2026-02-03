import { CACHE_MANAGER, type Cache } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>,
  ): Promise<void> {
    const namespaceArg = options?.namespace;
    const namespace = this.parseNamespace(namespaceArg);
    const pattern = options?.pattern ?? '*';

    if (
      namespaceArg !== undefined &&
      namespaceArg !== null &&
      namespaceArg !== '' &&
      !namespace
    ) {
      throw new Error(
        `Invalid --namespace. Valid values: ${NAMESPACE_VALUES.join(', ')}`,
      );
    }

    const namespacesToFlush = namespace ? [namespace] : NAMESPACE_VALUES;

    this.logger.log(
      namespace
        ? `Flushing namespace ${namespace} for pattern: ${pattern}...`
        : `Flushing all namespaces for pattern: ${pattern}...`,
    );

    for (const ns of namespacesToFlush) {
      const cacheStorage = new CacheStorageService(this.cacheManager, ns);
      await cacheStorage.flushByPattern(pattern);
    }

    this.logger.log('Cache flushed');
  }

  private parseNamespace(value: unknown): CacheStorageNamespace | null {
    if (
      typeof value === 'string' &&
      NAMESPACE_VALUES.includes(value as CacheStorageNamespace)
    ) {
      return value as CacheStorageNamespace;
    }
    return null;
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
