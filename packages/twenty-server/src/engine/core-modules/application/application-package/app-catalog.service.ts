import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import bytes from 'bytes';
import { isDefined } from 'twenty-shared/utils';

import { MAX_REQUEST_BODY_SIZE } from 'src/engine/constants/max-request-body-size.constant';
import { verifyAppCatalog } from 'src/engine/core-modules/application/application-package/utils/verify-app-catalog.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const APP_CATALOG_TIMEOUT_MS = 30_000;
const APP_CATALOG_LAST_SEQUENCE_CACHE_KEY = 'app-catalog:last-sequence';

@Injectable()
export class AppCatalogService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleApplications)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async findRequiredIntegrity({
    packageName,
    version,
  }: {
    packageName: string;
    version: string;
  }): Promise<string | undefined> {
    const catalogUrl = this.twentyConfigService.get('APP_CATALOG_URL');

    if (!isNonEmptyString(catalogUrl)) {
      return undefined;
    }

    const catalog = verifyAppCatalog({
      signedCatalog: await this.fetchSignedCatalogOrThrow(catalogUrl),
      publicKeys: this.twentyConfigService.get('APP_CATALOG_PUBLIC_KEYS'),
      minimumSequence:
        (await this.cacheStorageService.get<number>(
          APP_CATALOG_LAST_SEQUENCE_CACHE_KEY,
        )) ?? 0,
      now: new Date(),
    });

    await this.cacheStorageService.set(
      APP_CATALOG_LAST_SEQUENCE_CACHE_KEY,
      catalog.sequence,
    );

    const catalogApp = catalog.apps.find((app) => app.package === packageName);
    const integrity = catalogApp?.versions.find(
      (approvedVersion) => approvedVersion.version === version,
    )?.integrity;

    if (
      !isDefined(integrity) ||
      catalogApp?.revokedVersions.includes(version)
    ) {
      throw new ApplicationException(
        `${packageName}@${version} is not an approved version in the app catalog`,
        ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
      );
    }

    return integrity;
  }

  private async fetchSignedCatalogOrThrow(
    catalogUrl: string,
  ): Promise<unknown> {
    try {
      const response = await this.secureHttpClientService
        .getHttpClient({
          timeout: APP_CATALOG_TIMEOUT_MS,
          maxContentLength: bytes(MAX_REQUEST_BODY_SIZE) ?? undefined,
        })
        .get(catalogUrl);

      return response.data;
    } catch {
      throw new ApplicationException(
        'App catalog could not be fetched',
        ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
      );
    }
  }
}
