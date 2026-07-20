import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

describe('CacheStorageService', () => {
  const setup = (evalResult: number) => {
    const evalScript = jest.fn().mockResolvedValue(evalResult);
    const service = new CacheStorageService(
      {
        store: {
          name: 'redis',
          client: { eval: evalScript },
        },
      } as never,
      CacheStorageNamespace.EngineWorkspace,
    );

    return { evalScript, service };
  };

  it('atomically writes entries when an absent guard is unchanged', async () => {
    const { evalScript, service } = setup(1);

    await expect(
      service.msetIfUnchanged({
        guardKey: 'cache:hash',
        expectedGuardValue: undefined,
        entries: [
          { key: 'cache:data', value: { value: 'data' } },
          { key: 'cache:hash', value: 'new-hash' },
        ],
        ttl: 60_000,
      }),
    ).resolves.toBe(true);

    expect(evalScript).toHaveBeenCalledWith(
      expect.stringContaining("ARGV[1] == '1'"),
      {
        keys: [
          expect.stringMatching(/engine:workspace:cache:hash$/),
          expect.stringMatching(/engine:workspace:cache:data$/),
          expect.stringMatching(/engine:workspace:cache:hash$/),
        ],
        arguments: ['1', '', '60000', '{"value":"data"}', '"new-hash"'],
      },
    );
  });

  it('does not report a write when the guard changed', async () => {
    const { evalScript, service } = setup(0);

    await expect(
      service.msetIfUnchanged({
        guardKey: 'cache:hash',
        expectedGuardValue: 'old-hash',
        entries: [{ key: 'cache:hash', value: 'new-hash' }],
        ttl: 0,
      }),
    ).resolves.toBe(false);

    expect(evalScript).toHaveBeenCalledWith(expect.any(String), {
      keys: [
        expect.stringMatching(/engine:workspace:cache:hash$/),
        expect.stringMatching(/engine:workspace:cache:hash$/),
      ],
      arguments: ['0', '"old-hash"', '0', '"new-hash"'],
    });
  });
});
