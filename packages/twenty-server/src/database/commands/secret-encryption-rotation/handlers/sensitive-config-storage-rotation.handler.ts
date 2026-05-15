import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import {
  type SecretEncryptionRotationHandler,
  type SecretEncryptionRotationHandlerOptions,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import { buildPrimaryKeyIdEnvelopeLikePattern } from 'src/database/commands/secret-encryption-rotation/utils/build-non-current-keyid-like-pattern.util';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { type ConfigVariablesMetadataMap } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import { TypedReflect } from 'src/utils/typed-reflect';

type SensitiveConfigRow = { id: string; value: unknown };

@Injectable()
export class SensitiveConfigStorageRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'sensitive-config-storage';
  private readonly logger = new Logger(
    SensitiveConfigStorageRotationHandler.name,
  );

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  // ConfigStorage shares the `keyValuePair.value` (jsonb) column with
  // user/feature-flag entries — so there's no CHECK constraint and we have
  // to filter sensitive STRING config keys via reflection metadata, then
  // walk those rows row-by-row to skip any that are already on the primary
  // keyId.
  async countRemaining({
    primaryKeyId,
  }: {
    primaryKeyId: string;
  }): Promise<number> {
    const sensitiveStringKeys = this.collectSensitiveStringConfigKeys();

    if (sensitiveStringKeys.length === 0) {
      return 0;
    }

    const primaryPrefix = buildPrimaryKeyIdEnvelopeLikePattern(
      primaryKeyId,
    ).slice(0, -1);

    let total = 0;

    for (const key of sensitiveStringKeys) {
      const rows: SensitiveConfigRow[] = await this.dataSource.query(
        `SELECT id, value
           FROM "core"."keyValuePair"
          WHERE type = $1
            AND "userId" IS NULL
            AND "workspaceId" IS NULL
            AND key = $2`,
        [KeyValuePairType.CONFIG_VARIABLE, key],
      );

      for (const row of rows) {
        if (this.isV2EnvelopeNotOnPrimary(row.value, primaryPrefix)) {
          total++;
        }
      }
    }

    return total;
  }

  async run({
    primaryKeyId,
    batchSize: _batchSize,
    dryRun,
  }: SecretEncryptionRotationHandlerOptions): Promise<{
    rotated: number;
    skipped: number;
    errors: number;
  }> {
    const sensitiveStringKeys = this.collectSensitiveStringConfigKeys();

    if (sensitiveStringKeys.length === 0) {
      return { rotated: 0, skipped: 0, errors: 0 };
    }

    const primaryPrefix = buildPrimaryKeyIdEnvelopeLikePattern(
      primaryKeyId,
    ).slice(0, -1);

    let rotated = 0;
    let skipped = 0;
    let errors = 0;

    for (const key of sensitiveStringKeys) {
      const rows: SensitiveConfigRow[] = await this.dataSource.query(
        `SELECT id, value
           FROM "core"."keyValuePair"
          WHERE type = $1
            AND "userId" IS NULL
            AND "workspaceId" IS NULL
            AND key = $2`,
        [KeyValuePairType.CONFIG_VARIABLE, key],
      );

      for (const row of rows) {
        const rawValue = row.value;

        if (typeof rawValue !== 'string') {
          skipped++;
          continue;
        }

        if (!rawValue.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)) {
          skipped++;
          continue;
        }

        if (rawValue.startsWith(primaryPrefix)) {
          skipped++;
          continue;
        }

        try {
          const plaintext =
            this.secretEncryptionService.decryptVersioned(rawValue);
          const encrypted =
            this.secretEncryptionService.encryptVersioned(plaintext);

          if (!dryRun) {
            await this.dataSource.query(
              `UPDATE "core"."keyValuePair"
                  SET value = to_jsonb($1::text)
                WHERE id = $2`,
              [encrypted, row.id],
            );
          }

          rotated++;
        } catch (error) {
          errors++;
          this.logger.warn(
            `[${this.siteName}] failed to re-encrypt config key '${key}' row ${row.id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    return { rotated, skipped, errors };
  }

  private isV2EnvelopeNotOnPrimary(
    value: unknown,
    primaryPrefix: string,
  ): boolean {
    if (typeof value !== 'string') return false;
    if (!value.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)) return false;
    if (value.startsWith(primaryPrefix)) return false;

    return true;
  }

  private collectSensitiveStringConfigKeys(): string[] {
    const metadata = TypedReflect.getMetadata(
      'config-variables',
      ConfigVariables.prototype.constructor,
    ) as ConfigVariablesMetadataMap | undefined;

    if (!isDefined(metadata)) {
      return [];
    }

    return Object.entries(metadata)
      .filter(
        ([, descriptor]) =>
          descriptor?.isSensitive === true &&
          descriptor?.type === ConfigVariableType.STRING,
      )
      .map(([key]) => key);
  }
}
