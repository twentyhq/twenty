import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { getSaasAuthReceivedCodeCacheKey } from 'src/engine/core-modules/auth/constants/saas-auth-received-code-cache-key.constant';
import { SaasAuthReceiptController } from 'src/engine/core-modules/auth/controllers/saas-auth-receipt.controller';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';

describe('SaasAuthReceiptController', () => {
  let controller: SaasAuthReceiptController;
  let cacheStorage: jest.Mocked<CacheStorageService>;

  beforeEach(() => {
    cacheStorage = {
      get: jest.fn(),
    } as unknown as jest.Mocked<CacheStorageService>;

    controller = new SaasAuthReceiptController(cacheStorage);
  });

  it('should return true when the code was received', async () => {
    cacheStorage.get.mockResolvedValue(true);

    const result = await controller.checkReceived({ code: 'received-code' });

    expect(result).toEqual({ received: true });
    expect(cacheStorage.get).toHaveBeenCalledWith(
      getSaasAuthReceivedCodeCacheKey('received-code'),
    );
  });

  it('should return false when the code was not received', async () => {
    cacheStorage.get.mockResolvedValue(undefined);

    const result = await controller.checkReceived({ code: 'unknown-code' });

    expect(result).toEqual({ received: false });
    expect(cacheStorage.get).toHaveBeenCalledWith(
      getSaasAuthReceivedCodeCacheKey('unknown-code'),
    );
  });

  it('should reject requests with a missing code', async () => {
    await expect(controller.checkReceived({})).rejects.toMatchObject({
      code: AuthExceptionCode.INVALID_INPUT,
    } satisfies Partial<AuthException>);
  });
});
