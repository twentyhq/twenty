import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, In, IsNull, Raw, Repository } from 'typeorm';

import {
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationHandler,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
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
    currentEncryptionKeyId,
  }: {
    currentEncryptionKeyId: string;
  }): Promise<number> {
    const sensitiveStringConfigKeys = this.collectSensitiveStringConfigKeys();

    if (sensitiveStringConfigKeys.length === 0) {
      return 0;
    }

    return this.keyValuePairRepository.count({
      where: this.buildRotationFilter({
        currentEncryptionKeyId,
        sensitiveStringConfigKeys,
      }),
    });
  }

  async rotate({
    currentEncryptionKeyId,
    dryRun,
  }: SecretEncryptionRotationContext): Promise<SecretEncryptionRotationOutcome> {
    const sensitiveStringConfigKeys = this.collectSensitiveStringConfigKeys();

    if (sensitiveStringConfigKeys.length === 0) {
      return { rotated: 0, skipped: 0, errors: 0 };
    }

    const rows = await this.keyValuePairRepository.find({
      where: this.buildRotationFilter({
        currentEncryptionKeyId,
        sensitiveStringConfigKeys,
      }),
    });

    let rotated = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of rows) {
      const rawValue = row.value as unknown;

      if (typeof rawValue !== 'string') {
        skipped++;
        continue;
      }

      try {
        const plaintext =
          this.secretEncryptionService.decryptVersioned(rawValue);
        const reEncrypted =
          this.secretEncryptionService.encryptVersioned(plaintext);

        if (!dryRun) {
          const updateResult = await this.keyValuePairRepository.update(
            {
              id: row.id,
              value: Raw((alias) => `${alias}::text = :originalValueText`, {
                originalValueText: JSON.stringify(rawValue),
              }) as unknown as JSON,
            },
            { value: reEncrypted as unknown as JSON },
          );

          if ((updateResult.affected ?? 0) === 0) {
            skipped++;
            continue;
          }
        }

        rotated++;
      } catch (error) {
        errors++;
        this.logger.warn(
          `[${this.siteName}] failed to re-encrypt config key '${row.key}' row ${row.id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return { rotated, skipped, errors };
  }

  private buildRotationFilter({
    currentEncryptionKeyId,
    sensitiveStringConfigKeys,
  }: {
    currentEncryptionKeyId: string;
    sensitiveStringConfigKeys: string[];
  }): FindOptionsWhere<KeyValuePairEntity> {
    const anyV2Pattern = `"${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%"`;
    const currentEnvelopePattern = `"${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${currentEncryptionKeyId}:%"`;

    return {
      type: KeyValuePairType.CONFIG_VARIABLE,
      userId: IsNull(),
      workspaceId: IsNull(),
      key: In(sensitiveStringConfigKeys),
      value: Raw(
        (alias) =>
          `${alias}::text LIKE :anyV2 AND ${alias}::text NOT LIKE :current`,
        { anyV2: anyV2Pattern, current: currentEnvelopePattern },
      ) as unknown as JSON,
    };
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
