import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { AgentToolPreloadService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-tool-preload.service';

const AGENT = {
  id: 'agent-1',
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};
const EXPECTED_KEY = `agent-1:${AGENT.updatedAt.getTime()}`;
const TTL_MS = 1000 * 60 * 5;

describe('AgentToolPreloadService', () => {
  let service: AgentToolPreloadService;
  let cacheStorageService: { get: jest.Mock; set: jest.Mock };

  beforeEach(() => {
    cacheStorageService = { get: jest.fn(), set: jest.fn() };
    service = new AgentToolPreloadService(
      cacheStorageService as unknown as CacheStorageService,
    );
  });

  describe('getPreloadToolNames', () => {
    it('returns an empty array and does not slide when nothing is cached', async () => {
      cacheStorageService.get.mockResolvedValue(undefined);

      const result = await service.getPreloadToolNames(AGENT);

      expect(result).toEqual([]);
      expect(cacheStorageService.get).toHaveBeenCalledWith(EXPECTED_KEY);
      expect(cacheStorageService.set).not.toHaveBeenCalled();
    });

    it('returns the cached set and slides the TTL, keyed by updatedAt', async () => {
      cacheStorageService.get.mockResolvedValue(['find_many_customers']);

      const result = await service.getPreloadToolNames(AGENT);

      expect(result).toEqual(['find_many_customers']);
      expect(cacheStorageService.set).toHaveBeenCalledWith(
        EXPECTED_KEY,
        ['find_many_customers'],
        TTL_MS,
      );
    });
  });

  describe('recordToolUsage', () => {
    it('does nothing when there are no usable tool names', async () => {
      await service.recordToolUsage(AGENT, ['', '']);

      expect(cacheStorageService.get).not.toHaveBeenCalled();
      expect(cacheStorageService.set).not.toHaveBeenCalled();
    });

    it('merges with the existing set, dedupes and sorts', async () => {
      cacheStorageService.get.mockResolvedValue([
        'update_one_sales_call',
        'find_many_customers',
      ]);

      await service.recordToolUsage(AGENT, [
        'create_many_customers',
        'find_many_customers',
      ]);

      expect(cacheStorageService.set).toHaveBeenLastCalledWith(
        EXPECTED_KEY,
        [
          'create_many_customers',
          'find_many_customers',
          'update_one_sales_call',
        ],
        TTL_MS,
      );
    });

    it('caps the stored set to the maximum', async () => {
      cacheStorageService.get.mockResolvedValue([]);

      const manyToolNames = Array.from(
        { length: 20 },
        (_, index) => `tool_${String(index).padStart(2, '0')}`,
      );

      await service.recordToolUsage(AGENT, manyToolNames);

      const setCalls = cacheStorageService.set.mock.calls;
      const storedToolNames = setCalls[setCalls.length - 1]?.[1];

      expect(storedToolNames).toHaveLength(12);
    });
  });
});
