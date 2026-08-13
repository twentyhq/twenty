import { frontComponentCacheStorageService } from '../frontComponentCacheStorageService';

describe('frontComponentCacheStorageService', () => {
  describe('open', () => {
    afterEach(() => {
      Reflect.deleteProperty(globalThis, 'caches');
    });

    it('should return undefined when accessing caches throws, as in Firefox opaque-origin contexts', async () => {
      Object.defineProperty(globalThis, 'caches', {
        configurable: true,
        get() {
          throw new Error('NS_ERROR_FAILURE');
        },
      });

      await expect(frontComponentCacheStorageService.open()).resolves.toBe(
        undefined,
      );
    });

    it('should return undefined when caches is not available', async () => {
      await expect(frontComponentCacheStorageService.open()).resolves.toBe(
        undefined,
      );
    });

    it('should open the front component cache when caches is available', async () => {
      const fakeCache = { match: jest.fn() };
      const open = jest.fn().mockResolvedValue(fakeCache);

      Object.defineProperty(globalThis, 'caches', {
        configurable: true,
        value: { open },
      });

      await expect(frontComponentCacheStorageService.open()).resolves.toBe(
        fakeCache,
      );
      expect(open).toHaveBeenCalledWith('front-component-source-v1');
    });
  });
});
