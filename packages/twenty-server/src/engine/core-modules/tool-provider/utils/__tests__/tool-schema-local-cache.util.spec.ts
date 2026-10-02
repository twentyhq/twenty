import { ToolSchemaLocalCache } from 'src/engine/core-modules/tool-provider/utils/tool-schema-local-cache.util';

const createSchema = (description: string) => ({
  type: 'object',
  description,
});

describe('ToolSchemaLocalCache', () => {
  let now: number;

  const createCache = (maxSizeBytes = 1024 * 1024, idleTtlMs = 60_000) =>
    new ToolSchemaLocalCache({ maxSizeBytes, idleTtlMs, now: () => now });

  beforeEach(() => {
    now = 0;
  });

  it('should compute a schema once per key and metadata version', () => {
    const cache = createCache();
    const compute = jest.fn(() => createSchema('people'));

    const firstSchema = cache
      .getStore('workspace-1', 'version-1')
      .getOrCompute('find_many_people', compute);
    const secondSchema = cache
      .getStore('workspace-1', 'version-1')
      .getOrCompute('find_many_people', compute);

    expect(secondSchema).toBe(firstSchema);
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it('should cache tools without a valid schema', () => {
    const cache = createCache();
    const compute = jest.fn(() => null);
    const store = cache.getStore('workspace-1', 'version-1');

    expect(store.getOrCompute('group_by_people', compute)).toBeNull();
    expect(store.getOrCompute('group_by_people', compute)).toBeNull();
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it('should drop the schemas of a previous metadata version', () => {
    const cache = createCache();
    const compute = jest.fn(() => createSchema('people'));

    cache
      .getStore('workspace-1', 'version-1')
      .getOrCompute('find_many_people', compute);
    cache
      .getStore('workspace-1', 'version-2')
      .getOrCompute('find_many_people', compute);

    expect(compute).toHaveBeenCalledTimes(2);
    expect(cache.workspaceCount).toBe(1);
    expect(cache.sizeBytes).toBe(JSON.stringify(createSchema('people')).length);
  });

  it('should keep workspaces separate', () => {
    const cache = createCache();

    cache
      .getStore('workspace-1', 'version-1')
      .getOrCompute('find_many_people', () => createSchema('first'));

    const otherSchema = cache
      .getStore('workspace-2', 'version-1')
      .getOrCompute('find_many_people', () => createSchema('second'));

    expect(otherSchema).toEqual(createSchema('second'));
    expect(cache.workspaceCount).toBe(2);
  });

  it('should evict the least recently used workspaces past the size budget', () => {
    const schemaSizeBytes = JSON.stringify(createSchema('workspace')).length;
    const cache = createCache(schemaSizeBytes * 2);

    cache
      .getStore('workspace-1', 'version-1')
      .getOrCompute('tool', () => createSchema('workspace'));
    cache
      .getStore('workspace-2', 'version-1')
      .getOrCompute('tool', () => createSchema('workspace'));
    cache.getStore('workspace-1', 'version-1');
    cache
      .getStore('workspace-3', 'version-1')
      .getOrCompute('tool', () => createSchema('workspace'));

    const compute = jest.fn(() => createSchema('workspace'));

    cache.getStore('workspace-1', 'version-1').getOrCompute('tool', compute);
    expect(compute).not.toHaveBeenCalled();

    cache.getStore('workspace-2', 'version-1').getOrCompute('tool', compute);
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it('should keep a single workspace larger than the size budget', () => {
    const cache = createCache(1);
    const compute = jest.fn(() => createSchema('people'));
    const store = cache.getStore('workspace-1', 'version-1');

    store.getOrCompute('find_many_people', compute);
    store.getOrCompute('find_many_people', compute);

    expect(compute).toHaveBeenCalledTimes(1);
  });

  it('should evict workspaces left idle past the ttl', () => {
    const cache = createCache(1024 * 1024, 1_000);

    cache
      .getStore('workspace-1', 'version-1')
      .getOrCompute('find_many_people', () => createSchema('people'));

    now = 2_000;
    cache.getStore('workspace-2', 'version-1');

    expect(cache.workspaceCount).toBe(1);
    expect(cache.sizeBytes).toBe(0);
  });
});
