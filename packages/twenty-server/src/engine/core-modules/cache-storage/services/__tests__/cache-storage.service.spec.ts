import { CacheStorageService } from '../cache-storage.service';
import { CacheStorageNamespace } from '../../types/cache-storage-namespace.enum';
import { Cache } from '@nestjs/cache-manager';

describe('CacheStorageService - Lock Ownership Regression', () => {
  let service: CacheStorageService;
  let mockRedisClient: any;
  let mockCache: any;

  beforeEach(() => {
    mockRedisClient = {
      set: jest.fn(),
      eval: jest.fn(),
    };

    mockCache = {
      store: {
        name: 'redis',
        client: mockRedisClient,
      },
    };

    service = new CacheStorageService(
      mockCache as unknown as Cache,
      CacheStorageNamespace.IntegrationTests,
    );
  });

  it('should acquire lock with the provided owner token', async () => {
    mockRedisClient.set.mockResolvedValue('OK');
    const result = await service.acquireLock('workflow:123', 'owner-token-A', 5000);

    expect(result).toBe(true);
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      expect.stringContaining('workflow:123'),
      'owner-token-A',
      { NX: true, PX: 5000 },
    );
  });

  it('should release lock if the owner token matches (simulate Lua success)', async () => {
    mockRedisClient.eval.mockResolvedValue(1);
    const result = await service.releaseLock('workflow:123', 'owner-token-A');

    expect(result).toBe(true);
    expect(mockRedisClient.eval).toHaveBeenCalledWith(
      expect.stringContaining('if redis.call("get", KEYS[1]) == ARGV[1] then'),
      {
        keys: [expect.stringContaining('workflow:123')],
        arguments: ['owner-token-A'],
      },
    );
  });

  it('should leave lock intact if the owner token does not match (simulate lock expired and acquired by another process)', async () => {
    // When Lua script returns 0, it means the token didn't match (e.g. lock was taken by someone else)
    mockRedisClient.eval.mockResolvedValue(0);
    const result = await service.releaseLock('workflow:123', 'owner-token-A');

    expect(result).toBe(false);
    expect(mockRedisClient.eval).toHaveBeenCalledWith(
      expect.stringContaining('if redis.call("get", KEYS[1]) == ARGV[1] then'),
      {
        keys: [expect.stringContaining('workflow:123')],
        arguments: ['owner-token-A'],
      },
    );
  });
});
