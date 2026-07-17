import {
  FIND_ALL_VIEWS_CACHE_DEPENDENCIES,
  getFindAllViewsCacheDependencyVersion,
} from 'src/engine/api/graphql/graphql-config/utils/get-find-all-views-cache-dependency-version.util';

describe('getFindAllViewsCacheDependencyVersion', () => {
  const workspaceId = 'workspace-id';
  const hashes = Object.fromEntries(
    FIND_ALL_VIEWS_CACHE_DEPENDENCIES.map((dependency, index) => [
      dependency,
      `hash-${index}`,
    ]),
  );

  const getVersion = async ({
    getCacheHashes = jest.fn().mockResolvedValue(hashes),
    getOrRecompute = jest.fn(),
  } = {}) =>
    getFindAllViewsCacheDependencyVersion({
      workspaceCacheService: {
        getCacheHashes,
        getOrRecompute,
      } as never,
      workspaceId,
    });

  it('returns the same version for the same ordered dependency hashes', async () => {
    const firstVersion = await getVersion();
    const secondVersion = await getVersion();

    expect(firstVersion).toBe(secondVersion);
  });

  it.each(FIND_ALL_VIEWS_CACHE_DEPENDENCIES)(
    'changes the version when %s changes',
    async (changedDependency) => {
      const initialVersion = await getVersion();
      const changedVersion = await getVersion({
        getCacheHashes: jest.fn().mockResolvedValue({
          ...hashes,
          [changedDependency]: 'changed-hash',
        }),
      });

      expect(changedVersion).not.toBe(initialVersion);
    },
  );

  it('recomputes only missing dependencies before deriving the version', async () => {
    const { flatViewSortMaps: _missingHash, ...coldHashes } = hashes;
    const getCacheHashes = jest
      .fn()
      .mockResolvedValueOnce(coldHashes)
      .mockResolvedValueOnce(hashes);
    const getOrRecompute = jest.fn().mockResolvedValue(undefined);

    const version = await getVersion({ getCacheHashes, getOrRecompute });

    expect(getOrRecompute).toHaveBeenCalledWith(workspaceId, [
      'flatViewSortMaps',
    ]);
    expect(version).toBeDefined();
  });

  it('returns undefined when hashes remain unavailable after recomputation', async () => {
    const { flatViewSortMaps: _missingHash, ...incompleteHashes } = hashes;
    const getCacheHashes = jest.fn().mockResolvedValue(incompleteHashes);
    const getOrRecompute = jest.fn().mockResolvedValue(undefined);

    const version = await getVersion({ getCacheHashes, getOrRecompute });

    expect(getCacheHashes).toHaveBeenCalledTimes(2);
    expect(version).toBeUndefined();
  });
});
