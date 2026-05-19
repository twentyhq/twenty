import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationVariableRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/application-registration-variable-rotation.handler';
import { ApplicationVariableRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/application-variable-rotation.handler';
import { ConnectedAccountTokensRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/connected-account-tokens-rotation.handler';
import { SensitiveConfigStorageRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/sensitive-config-storage-rotation.handler';
import { SigningKeyPrivateKeysRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/signing-key-private-keys-rotation.handler';
import { TotpSecretsRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/totp-secrets-rotation.handler';
import {
  type SecretEncryptionRotationHandler,
  type SecretEncryptionRotationSiteResult,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import { computeEncryptionKeyId } from 'src/engine/core-modules/secret-encryption/utils/compute-encryption-key-id.util';
import { resolveEncryptionKeysOrThrow } from 'src/engine/core-modules/secret-encryption/utils/resolve-encryption-keys-or-throw.util';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

export type RotationRunOptions = {
  site?: string;
  batchSize: number;
  dryRun: boolean;
};

export type RotationRunSummary = {
  primaryKeyId: string;
  fallbackKeyId: string | null;
  results: SecretEncryptionRotationSiteResult[];
  totalDurationMs: number;
};

@Injectable()
export class SecretEncryptionRotationRunnerService {
  private readonly logger = new Logger(
    SecretEncryptionRotationRunnerService.name,
  );

  private readonly handlers: SecretEncryptionRotationHandler[];

  constructor(
    private readonly environmentConfigDriver: EnvironmentConfigDriver,
    connectedAccountTokensRotationHandler: ConnectedAccountTokensRotationHandler,
    applicationVariableRotationHandler: ApplicationVariableRotationHandler,
    applicationRegistrationVariableRotationHandler: ApplicationRegistrationVariableRotationHandler,
    signingKeyPrivateKeysRotationHandler: SigningKeyPrivateKeysRotationHandler,
    sensitiveConfigStorageRotationHandler: SensitiveConfigStorageRotationHandler,
    totpSecretsRotationHandler: TotpSecretsRotationHandler,
  ) {
    this.handlers = [
      connectedAccountTokensRotationHandler,
      applicationVariableRotationHandler,
      applicationRegistrationVariableRotationHandler,
      signingKeyPrivateKeysRotationHandler,
      sensitiveConfigStorageRotationHandler,
      totpSecretsRotationHandler,
    ];
  }

  listSiteNames(): string[] {
    return this.handlers.map((handler) => handler.siteName);
  }

  async run(options: RotationRunOptions): Promise<RotationRunSummary> {
    const keys = resolveEncryptionKeysOrThrow({
      environmentConfigDriver: this.environmentConfigDriver,
    });
    const primaryKeyId = computeEncryptionKeyId({ rawKey: keys.primary });
    const fallbackKeyId = isDefined(keys.fallback)
      ? computeEncryptionKeyId({ rawKey: keys.fallback })
      : null;

    this.logger.log(
      `[secret-encryption:rotate] primary keyId: ${primaryKeyId}${
        options.dryRun ? ' (dry-run)' : ''
      }`,
    );

    if (isDefined(fallbackKeyId)) {
      this.logger.log(
        `[secret-encryption:rotate] fallback keyId: ${fallbackKeyId}`,
      );
    } else {
      this.logger.warn(
        '[secret-encryption:rotate] FALLBACK_ENCRYPTION_KEY is not set — rows currently encrypted under a previous primary key cannot be decrypted by this command. Set FALLBACK_ENCRYPTION_KEY to the previous ENCRYPTION_KEY before running rotation.',
      );
    }

    const handlersToRun = isDefined(options.site)
      ? this.handlers.filter((handler) => handler.siteName === options.site)
      : this.handlers;

    if (handlersToRun.length === 0) {
      throw new Error(
        `Unknown rotation site: '${options.site}'. Known sites: ${this.listSiteNames().join(
          ', ',
        )}.`,
      );
    }

    const startedAt = Date.now();
    const results: SecretEncryptionRotationSiteResult[] = [];

    for (const handler of handlersToRun) {
      const siteStartedAt = Date.now();

      const remainingBefore = await handler.countRemaining({ primaryKeyId });

      this.logger.log(
        `[${handler.siteName}] start: ${remainingBefore} row(s) need rotation`,
      );

      const { rotated, skipped, errors } = await handler.rotate({
        primaryKeyId,
        batchSize: options.batchSize,
        dryRun: options.dryRun,
      });

      const durationMs = Date.now() - siteStartedAt;
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

    const totalDurationMs = Date.now() - startedAt;

    this.logSummary({ primaryKeyId, fallbackKeyId, results, totalDurationMs });

    return { primaryKeyId, fallbackKeyId, results, totalDurationMs };
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
