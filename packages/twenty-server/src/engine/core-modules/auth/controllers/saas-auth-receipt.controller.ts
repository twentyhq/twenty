import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { getSaasAuthReceivedCodeCacheKey } from 'src/engine/core-modules/auth/constants/saas-auth-received-code-cache-key.constant';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { SaasAuthCheckReceivedSecretGuard } from 'src/engine/core-modules/auth/guards/saas-auth-check-received-secret.guard';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

type CheckReceivedBody = {
  code?: string;
};

@Controller()
@UseFilters(AuthRestApiExceptionFilter)
export class SaasAuthReceiptController {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  @Post('check-received')
  @UseGuards(
    PublicEndpointGuard,
    SaasAuthCheckReceivedSecretGuard,
    NoPermissionGuard,
  )
  async checkReceived(
    @Body() body: CheckReceivedBody,
  ): Promise<{ received: boolean }> {
    if (!body.code) {
      throw new AuthException(
        'Missing SaaS authentication code',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const received = await this.cacheStorage.get<boolean>(
      getSaasAuthReceivedCodeCacheKey(body.code),
    );

    return { received: received === true };
  }
}
