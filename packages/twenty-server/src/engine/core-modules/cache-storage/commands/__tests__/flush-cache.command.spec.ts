import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';

import { FlushCacheCommand } from 'src/engine/core-modules/cache-storage/commands/flush-cache.command';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

describe('FlushCacheCommand', () => {
  let command: FlushCacheCommand;
  let benchmarks: CacheStorageService;
  let metrics: CacheStorageService;

  beforeEach(async () => {
    const values = new Map<string, unknown>();
    const cache = {
      get: jest.fn(async (key: string) => values.get(key)),
      set: jest.fn(async (key: string, value: unknown) => {
        values.set(key, value);
      }),
      store: {
        name: 'redis',
        client: {
          scan: jest.fn(
            async (_cursor: number, options: { MATCH: string }) => ({
              cursor: 0,
              keys: [...values.keys()].filter((key) =>
                key.startsWith(options.MATCH.slice(0, -1)),
              ),
            }),
          ),
          del: jest.fn(async (keys: string[]) => {
            keys.forEach((key) => values.delete(key));
          }),
        },
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        FlushCacheCommand,
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    command = module.get(FlushCacheCommand);
    benchmarks = new CacheStorageService(
      module.get(CACHE_MANAGER),
      CacheStorageNamespace.EngineAiModelBenchmarks,
    );
    metrics = new CacheStorageService(
      module.get(CACHE_MANAGER),
      CacheStorageNamespace.EngineMetrics,
    );
    await benchmarks.set('catalog', { fetchedAt: '2026-09-08' }, 0);
    await benchmarks.set('refresh-state', { requestsUsed: 30 }, 0);
    await benchmarks.set('refresh-lock', true, 60_000);
    await metrics.set('sample', 10, 0);
  });

  it('preserves the benchmark catalog, budget and lock during deployment cache flushes', async () => {
    await command.run([]);

    expect(await benchmarks.get('catalog')).toEqual({
      fetchedAt: '2026-09-08',
    });
    expect(await benchmarks.get('refresh-state')).toEqual({
      requestsUsed: 30,
    });
    expect(await benchmarks.get('refresh-lock')).toBe(true);
    expect(await metrics.get('sample')).toBeUndefined();
  });

  it('allows an explicit benchmark namespace flush', async () => {
    await command.run([], {
      namespace: CacheStorageNamespace.EngineAiModelBenchmarks,
    });

    expect(await benchmarks.get('catalog')).toBeUndefined();
    expect(await benchmarks.get('refresh-state')).toBeUndefined();
    expect(await metrics.get('sample')).toBe(10);
  });
});
