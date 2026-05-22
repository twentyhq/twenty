import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { performance } from 'perf_hooks';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  SECRET_ENCRYPTION_ROTATION_SITE_NAME,
  type SecretEncryptionRotationSiteName,
} from 'src/database/commands/secret-encryption-rotation/constants/secret-encryption-rotation-site-name.constant';
import { ColumnRotationSiteHandler } from 'src/database/commands/secret-encryption-rotation/handlers/column-rotation-site.handler';
import { ConnectionParametersRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/connection-parameters-rotation.handler';
import { SensitiveConfigStorageRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/sensitive-config-storage-rotation.handler';
import {
  SecretEncryptionRotationHandler,
  type SecretEncryptionRotationSiteResult,
} from 'src/database/commands/secret-encryption-rotation/interfaces/secret-encryption-rotation-handler.interface';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { SigningKeyEntity } from 'src/engine/core-modules/jwt/entities/signing-key.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { computeEncryptionKeyId } from 'src/engine/core-modules/secret-encryption/utils/compute-encryption-key-id.util';
import { resolveEncryptionKeysOrThrow } from 'src/engine/core-modules/secret-encryption/utils/resolve-encryption-keys-or-throw.util';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export type RotationRunOptions = {
  site?: SecretEncryptionRotationSiteName | string;
  batchSize: number;
  dryRun: boolean;
};

export type RotationRunSummary = {
  currentEncryptionKeyId: string;
  fallbackEncryptionKeyId: string | null;
  results: SecretEncryptionRotationSiteResult[];
  totalDurationMs: number;
};

@Injectable()
export class SecretEncryptionRotationRunnerService {
  private readonly logger = new Logger(
    SecretEncryptionRotationRunnerService.name,
  );

  private readonly handlersBySiteName: Map<
    SecretEncryptionRotationSiteName,
    SecretEncryptionRotationHandler
  >;

  constructor(
    private readonly environmentConfigDriver: EnvironmentConfigDriver,
    secretEncryptionService: SecretEncryptionService,
    connectionParametersRotationHandler: ConnectionParametersRotationHandler,
    sensitiveConfigStorageRotationHandler: SensitiveConfigStorageRotationHandler,
    @InjectRepository(ApplicationRegistrationVariableEntity)
    applicationRegistrationVariableRepository: Repository<ApplicationRegistrationVariableEntity>,
    @InjectRepository(ApplicationVariableEntity)
    applicationVariableRepository: Repository<ApplicationVariableEntity>,
    @InjectRepository(ConnectedAccountEntity)
    connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(SigningKeyEntity)
    signingKeyRepository: Repository<SigningKeyEntity>,
    @InjectRepository(TwoFactorAuthenticationMethodEntity)
    twoFactorAuthenticationMethodRepository: Repository<TwoFactorAuthenticationMethodEntity>,
  ) {
    const handlers: SecretEncryptionRotationHandler[] = [
      new ColumnRotationSiteHandler(
        {
          siteName:
            SECRET_ENCRYPTION_ROTATION_SITE_NAME.CONNECTED_ACCOUNT_ACCESS_TOKEN,
          repository: connectedAccountRepository,
          encryptedColumn: 'accessToken',
          isWorkspaceScoped: true,
        },
        secretEncryptionService,
      ),
      new ColumnRotationSiteHandler(
        {
          siteName:
            SECRET_ENCRYPTION_ROTATION_SITE_NAME.CONNECTED_ACCOUNT_REFRESH_TOKEN,
          repository: connectedAccountRepository,
          encryptedColumn: 'refreshToken',
          isWorkspaceScoped: true,
        },
        secretEncryptionService,
      ),
      connectionParametersRotationHandler,
      new ColumnRotationSiteHandler(
        {
          siteName: SECRET_ENCRYPTION_ROTATION_SITE_NAME.APPLICATION_VARIABLE,
          repository: applicationVariableRepository,
          encryptedColumn: 'value',
          isWorkspaceScoped: true,
          extraWhere: { isSecret: true },
        },
        secretEncryptionService,
      ),
      new ColumnRotationSiteHandler(
        {
          siteName:
            SECRET_ENCRYPTION_ROTATION_SITE_NAME.APPLICATION_REGISTRATION_VARIABLE,
          repository: applicationRegistrationVariableRepository,
          encryptedColumn: 'encryptedValue',
        },
        secretEncryptionService,
      ),
      new ColumnRotationSiteHandler(
        {
          siteName:
            SECRET_ENCRYPTION_ROTATION_SITE_NAME.SIGNING_KEY_PRIVATE_KEY,
          repository: signingKeyRepository,
          encryptedColumn: 'privateKey',
        },
        secretEncryptionService,
      ),
      new ColumnRotationSiteHandler(
        {
          siteName: SECRET_ENCRYPTION_ROTATION_SITE_NAME.TOTP_SECRET,
          repository: twoFactorAuthenticationMethodRepository,
          encryptedColumn: 'secret',
          isWorkspaceScoped: true,
        },
        secretEncryptionService,
      ),
      sensitiveConfigStorageRotationHandler,
    ];

    this.handlersBySiteName = new Map(
      handlers.map((handler) => [handler.siteName, handler]),
    );
  }

  listSiteNames(): SecretEncryptionRotationSiteName[] {
    return Array.from(this.handlersBySiteName.keys());
  }

  async run(options: RotationRunOptions): Promise<RotationRunSummary> {
    const { primary: currentEncryptionKey, fallback: fallbackEncryptionKey } =
      resolveEncryptionKeysOrThrow({
        environmentConfigDriver: this.environmentConfigDriver,
      });
    const currentEncryptionKeyId = computeEncryptionKeyId({
      rawKey: currentEncryptionKey,
    });
    const fallbackEncryptionKeyId = isDefined(fallbackEncryptionKey)
      ? computeEncryptionKeyId({ rawKey: fallbackEncryptionKey })
      : null;

    this.logger.log(
      `[secret-encryption:rotate] current encryption key id: ${currentEncryptionKeyId}${
        options.dryRun ? ' (dry-run)' : ''
      }`,
    );

    if (isDefined(fallbackEncryptionKeyId)) {
      this.logger.log(
        `[secret-encryption:rotate] fallback encryption key id: ${fallbackEncryptionKeyId}`,
      );
    } else {
      this.logger.warn(
        '[secret-encryption:rotate] FALLBACK_ENCRYPTION_KEY is not set — rows encrypted under a previous ENCRYPTION_KEY cannot be decrypted by this command. Set FALLBACK_ENCRYPTION_KEY to the previous ENCRYPTION_KEY before running rotation.',
      );
    }

    const handlersToRun = this.resolveHandlersToRun(options.site);

    const startedAt = performance.now();
    const results: SecretEncryptionRotationSiteResult[] = [];

    for (const handler of handlersToRun) {
      const siteStartedAt = performance.now();

      const remainingBefore = await handler.countRemaining({
        currentEncryptionKeyId,
      });

      this.logger.log(
        `[${handler.siteName}] start: ${remainingBefore} row(s) need rotation`,
      );

      const { rotated, skipped, errors } = await handler.rotate({
        currentEncryptionKeyId,
        batchSize: options.batchSize,
        dryRun: options.dryRun,
      });

      const durationMs = Math.round(performance.now() - siteStartedAt);
      const result: SecretEncryptionRotationSiteResult = {
        siteName: handler.siteName,
        remainingBefore,
        rotated,
        skipped,
        errors,
        durationMs,
      };

      results.push(result);

      this.logger.log(
        `[${handler.siteName}] DONE in ${durationMs}ms — rotated=${rotated} skipped=${skipped} errors=${errors}`,
      );
    }

    const totalDurationMs = Math.round(performance.now() - startedAt);

    this.logSummary({
      currentEncryptionKeyId,
      fallbackEncryptionKeyId,
      results,
      totalDurationMs,
    });

    return {
      currentEncryptionKeyId,
      fallbackEncryptionKeyId,
      results,
      totalDurationMs,
    };
  }

  private resolveHandlersToRun(
    site: string | undefined,
  ): SecretEncryptionRotationHandler[] {
    if (!isDefined(site)) {
      return Array.from(this.handlersBySiteName.values());
    }

    const handler = this.handlersBySiteName.get(
      site as SecretEncryptionRotationSiteName,
    );

    if (!isDefined(handler)) {
      throw new Error(
        `Unknown rotation site: '${site}'. Known sites: ${this.listSiteNames().join(
          ', ',
        )}.`,
      );
    }

    return [handler];
  }

  private logSummary(summary: RotationRunSummary): void {
    const totalRotated = summary.results.reduce(
      (sum, result) => sum + result.rotated,
      0,
    );
    const totalSkipped = summary.results.reduce(
      (sum, result) => sum + result.skipped,
      0,
    );
    const totalErrors = summary.results.reduce(
      (sum, result) => sum + result.errors,
      0,
    );

    this.logger.log('[secret-encryption:rotate] summary');

    for (const result of summary.results) {
      this.logger.log(
        `  ${result.siteName.padEnd(36)} rotated=${result.rotated} skipped=${result.skipped} errors=${result.errors} (${result.durationMs}ms)`,
      );
    }

    this.logger.log(
      `[secret-encryption:rotate] all sites complete in ${summary.totalDurationMs}ms — rotated=${totalRotated} skipped=${totalSkipped} errors=${totalErrors}`,
    );
  }
}
