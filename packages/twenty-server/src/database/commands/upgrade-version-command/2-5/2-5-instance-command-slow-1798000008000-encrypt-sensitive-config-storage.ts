import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { DataSource, QueryRunner } from 'typeorm';

import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { isEncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/is-encrypted-string.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { type ConfigVariablesMetadataMap } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { TypedReflect } from 'src/utils/typed-reflect';

type SensitiveConfigRow = { id: string; value: unknown };

// Legacy CTR ciphertext is base64-encoded and at least 16 bytes (one IV
// block) — i.e. ≥ 22 base64 chars. Anything outside that shape is plaintext
// that must be encrypted as-is: CTR decrypt has no integrity tag and would
// silently turn a real secret into garbage instead of throwing.
const LEGACY_CTR_LOOKS_LIKE_BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;
const LEGACY_CTR_MIN_LENGTH = 22;

const looksLikeLegacyCtrCiphertext = (value: string): boolean =>
  value.length >= LEGACY_CTR_MIN_LENGTH &&
  LEGACY_CTR_LOOKS_LIKE_BASE64_RE.test(value);

@RegisteredInstanceCommand('2.5.0', 1798000008000, { type: 'slow' })
export class EncryptSensitiveConfigStorageSlowInstanceCommand implements SlowInstanceCommand {
  private readonly logger = new Logger(
    EncryptSensitiveConfigStorageSlowInstanceCommand.name,
  );

  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  // ConfigStorage shares the `keyValuePair.value` (jsonb) column with
  // user/feature-flag entries and with non-sensitive config — so a CHECK
  // constraint cannot be added column-wide. The backfill walks only the
  // CONFIG_VARIABLE rows whose key is declared `isSensitive` + STRING in
  // the ConfigVariables metadata, decrypts legacy CTR ciphertext (or treats a
  // non-ciphertext value as plaintext), and re-encrypts it into the
  // instance-scoped versioned envelope. Idempotent: already-v2 rows are left
  // untouched.
  async runDataMigration(dataSource: DataSource): Promise<void> {
    const sensitiveStringKeys = this.collectSensitiveStringConfigKeys();

    if (sensitiveStringKeys.length === 0) {
      return;
    }

    for (const key of sensitiveStringKeys) {
      const rows: SensitiveConfigRow[] = await dataSource.query(
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
          continue;
        }

        if (rawValue === '' || isEncryptedString(rawValue)) {
          continue;
        }

        let plaintext: PlaintextString;

        if (looksLikeLegacyCtrCiphertext(rawValue)) {
          try {
            plaintext = this.secretEncryptionService.decrypt(
              rawValue,
            ) as PlaintextString;
          } catch (error) {
            this.logger.warn(
              `keyValuePair config row ${row.id} (key "${key}") value not valid ciphertext; treating as plaintext. ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            plaintext = rawValue as PlaintextString;
          }
        } else {
          this.logger.warn(
            `keyValuePair config row ${row.id} (key "${key}") value is not legacy CTR ciphertext; treating as plaintext.`,
          );
          plaintext = rawValue as PlaintextString;
        }

        if (!isDefined(plaintext)) {
          continue;
        }

        const encrypted =
          this.secretEncryptionService.encryptVersioned(plaintext);

        await dataSource.query(
          `UPDATE "core"."keyValuePair"
              SET value = to_jsonb($1::text)
            WHERE id = $2`,
          [encrypted, row.id],
        );
      }
    }
  }

  // No CHECK constraint: the jsonb `value` column is heterogeneous (it
  // stores booleans, numbers, strings, JSON for both sensitive and
  // non-sensitive config plus unrelated user/feature-flag rows), so no
  // single CHECK can usefully constrain it.
  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
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
