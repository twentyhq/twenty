import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';

import { performance } from 'perf_hooks';
import { DataSource } from 'typeorm';

import {
  SECRET_ENCRYPTION_ROTATION_SITE_ENTRIES,
  SECRET_ENCRYPTION_ROTATION_UNTYPED_SITE_ENTRIES,
  type SecretEncryptionRotationSiteName,
} from 'src/database/commands/secret-encryption-rotation/constants/secret-encryption-rotation-site-entries.constant';
import { ColumnRotationSiteHandler } from 'src/database/commands/secret-encryption-rotation/handlers/column-rotation-site.handler';
import {
  SecretEncryptionRotationHandler,
  type SecretEncryptionRotationSiteResult,
} from 'src/database/commands/secret-encryption-rotation/interfaces/secret-encryption-rotation-handler.interface';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { computeEncryptionKeyId } from 'src/engine/core-modules/secret-encryption/utils/compute-encryption-key-id.util';
import { resolveEncryptionKeysOrThrow } from 'src/engine/core-modules/secret-encryption/utils/resolve-encryption-keys-or-throw.util';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { isDefined, typedObjectEntries } from 'twenty-shared/utils';

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
export class SecretEncryptionRotationRunnerService implements OnModuleInit {
  private readonly logger = new Logger(
    SecretEncryptionRotationRunnerService.name,
  );

  private readonly handlersBySiteName = new Map<
    SecretEncryptionRotationSiteName,
    SecretEncryptionRotationHandler
  >();

  constructor(
    private readonly environmentConfigDriver: EnvironmentConfigDriver,
    private readonly secretEncryptionService: SecretEncryptionService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit(): void {
    for (const entry of Object.values(
      SECRET_ENCRYPTION_ROTATION_SITE_ENTRIES,
    )) {
      const repository = this.coreDataSource.getRepository(entry.entity);

      for (const [encryptedColumn, meta] of typedObjectEntries(
        entry.columnSiteNames,
      )) {
        const handler = isDefined(meta.customHandler)
          ? this.moduleRef.get(meta.customHandler)
          : new ColumnRotationSiteHandler(
              {
                repository,
                encryptedColumn,
                isWorkspaceScoped: meta.isWorkspaceScoped,
                extraWhere: meta.extraWhere,
              },
              this.secretEncryptionService,
            );

        this.handlersBySiteName.set(meta.siteName, handler);
      }
    }

    for (const entry of Object.values(
      SECRET_ENCRYPTION_ROTATION_UNTYPED_SITE_ENTRIES,
    )) {
      this.handlersBySiteName.set(
        entry.siteName,
        this.moduleRef.get(entry.handler),
      );
    }
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

    for (const [siteName, handler] of handlersToRun) {
      const siteStartedAt = performance.now();

      const remainingBefore = await handler.countRemaining({
        siteName,
        currentEncryptionKeyId,
      });

      this.logger.log(
        `[${siteName}] start: ${remainingBefore} row(s) need rotation`,
      );

      const { rotated, skipped, errors } = await handler.rotate({
        siteName,
        currentEncryptionKeyId,
        batchSize: options.batchSize,
        dryRun: options.dryRun,
      });

      const durationMs = Math.round(performance.now() - siteStartedAt);
      const result: SecretEncryptionRotationSiteResult = {
        siteName,
        remainingBefore,
        rotated,
        skipped,
        errors,
        durationMs,
      };

      results.push(result);

      this.logger.log(
        `[${siteName}] DONE in ${durationMs}ms — rotated=${rotated} skipped=${skipped} errors=${errors}`,
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
  ): Array<
    [SecretEncryptionRotationSiteName, SecretEncryptionRotationHandler]
  > {
    if (!isDefined(site)) {
      return Array.from(this.handlersBySiteName.entries());
    }

    const siteName = site as SecretEncryptionRotationSiteName;
    const handler = this.handlersBySiteName.get(siteName);

    if (!isDefined(handler)) {
      throw new Error(
        `Unknown rotation site: '${site}'. Known sites: ${this.listSiteNames().join(
          ', ',
        )}.`,
      );
    }

    return [[siteName, handler]];
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
