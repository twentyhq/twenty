import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import bytes from 'bytes';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { MAX_REQUEST_BODY_SIZE } from 'src/engine/constants/max-request-body-size.constant';
import { verifyAppCatalog } from 'src/engine/core-modules/application/application-package/utils/verify-app-catalog.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const APP_CATALOG_TIMEOUT_MS = 30_000;
const APP_CATALOG_LAST_SEQUENCE_KEY = 'APP_CATALOG_LAST_SEQUENCE';
const ADVANCE_LAST_SEQUENCE_QUERY = `
  INSERT INTO core."keyValuePair" ("key", "value", "type")
  VALUES ($1, to_jsonb($2::bigint), 'USER_VARIABLE')
  ON CONFLICT ("key") WHERE "userId" is NULL AND "workspaceId" is NULL AND "applicationId" is NULL
  DO UPDATE SET "value" = EXCLUDED."value"
  WHERE ("keyValuePair"."value")::bigint <= (EXCLUDED."value")::bigint
  RETURNING "id"`;

@Injectable()
export class AppCatalogService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
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
      now: new Date(),
    });

    const advancedRows: unknown[] = await this.coreDataSource.query(
      ADVANCE_LAST_SEQUENCE_QUERY,
      [APP_CATALOG_LAST_SEQUENCE_KEY, catalog.sequence],
    );

    if (advancedRows.length === 0) {
      throw new ApplicationException(
        `App catalog rejected: sequence ${catalog.sequence} is older than the last one applied`,
        ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
      );
    }

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
