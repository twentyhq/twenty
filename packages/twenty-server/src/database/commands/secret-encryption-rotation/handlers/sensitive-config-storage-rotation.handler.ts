import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import {
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationHandler,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import { buildPrimaryEncryptionKeyIdEnvelopeLikePattern } from 'src/database/commands/secret-encryption-rotation/utils/build-non-current-encryption-key-id-like-pattern.util';
import {
  KeyValuePairEntity,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { type ConfigVariablesMetadataMap } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import { TypedReflect } from 'src/utils/typed-reflect';

@Injectable()
export class SensitiveConfigStorageRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'sensitive-config-storage';
  private readonly logger = new Logger(
    SensitiveConfigStorageRotationHandler.name,
  );

  constructor(
    @InjectRepository(KeyValuePairEntity)
    private readonly keyValuePairRepository: Repository<KeyValuePairEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async countRemaining({
    primaryEncryptionKeyId,
  }: {
    primaryEncryptionKeyId: string;
  }): Promise<number> {
    const sensitiveStringConfigKeys = this.collectSensitiveStringConfigKeys();

    if (sensitiveStringConfigKeys.length === 0) {
      return 0;
    }

    const primaryEncryptionKeyEnvelopePrefix =
      buildPrimaryEncryptionKeyIdEnvelopeLikePattern(
        primaryEncryptionKeyId,
      ).slice(0, -1);

    let total = 0;

    for (const configKey of sensitiveStringConfigKeys) {
      const rows = await this.findInstanceConfigRows(configKey);

      for (const row of rows) {
        if (
          this.isV2EnvelopeNotOnPrimary(
            row.value,
            primaryEncryptionKeyEnvelopePrefix,
          )
        ) {
          total++;
        }
      }
    }

    return total;
  }

  async rotate({
    primaryEncryptionKeyId,
    dryRun,
  }: SecretEncryptionRotationContext): Promise<SecretEncryptionRotationOutcome> {
    const sensitiveStringConfigKeys = this.collectSensitiveStringConfigKeys();

    if (sensitiveStringConfigKeys.length === 0) {
      return { rotated: 0, skipped: 0, errors: 0 };
    }

    const primaryEncryptionKeyEnvelopePrefix =
      buildPrimaryEncryptionKeyIdEnvelopeLikePattern(
        primaryEncryptionKeyId,
      ).slice(0, -1);

    let rotated = 0;
    let skipped = 0;
    let errors = 0;

    for (const configKey of sensitiveStringConfigKeys) {
      const rows = await this.findInstanceConfigRows(configKey);

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

        if (rawValue.startsWith(primaryEncryptionKeyEnvelopePrefix)) {
          skipped++;
          continue;
        }

        try {
          const plaintext =
            this.secretEncryptionService.decryptVersioned(rawValue);
          const reEncrypted =
            this.secretEncryptionService.encryptVersioned(plaintext);

          if (!dryRun) {
            const updateResult = await this.keyValuePairRepository
              .createQueryBuilder()
              .update()
              .set({
                value: () => 'to_jsonb(:reEncrypted::text)',
              })
              .where('id = :id')
              .andWhere('value::text = :originalValueText')
              .setParameters({
                id: row.id,
                reEncrypted,
                originalValueText: JSON.stringify(rawValue),
              })
              .execute();

            if ((updateResult.affected ?? 0) === 0) {
              skipped++;
              continue;
            }
          }

          rotated++;
        } catch (error) {
          errors++;
          this.logger.warn(
            `[${this.siteName}] failed to re-encrypt config key '${configKey}' row ${row.id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    return { rotated, skipped, errors };
  }

  private async findInstanceConfigRows(
    configKey: string,
  ): Promise<{ id: string; value: unknown }[]> {
    const rows = await this.keyValuePairRepository.find({
      where: {
        type: KeyValuePairType.CONFIG_VARIABLE,
        userId: IsNull(),
        workspaceId: IsNull(),
        key: configKey,
      },
    });

    return rows.map((row) => ({
      id: row.id,
      value: row.value as unknown,
    }));
  }

  private isV2EnvelopeNotOnPrimary(
    value: unknown,
    primaryEncryptionKeyEnvelopePrefix: string,
  ): boolean {
    if (typeof value !== 'string') return false;
    if (!value.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)) return false;
    if (value.startsWith(primaryEncryptionKeyEnvelopePrefix)) return false;

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
      .map(([configKey]) => configKey);
  }
}
