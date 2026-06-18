import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { DataSource, QueryRunner } from 'typeorm';

import { isEncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/is-encrypted-string.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const BACKFILL_BATCH_SIZE = 500;

const ENCRYPTED_VALUE_CHECK_CONSTRAINT_NAME =
  'CHK_applicationRegistrationVariable_encryptedValue_encrypted';

const V2_ENCRYPTED_LIKE_PATTERN = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%`;

type ApplicationRegistrationVariableRow = {
  id: string;
  encryptedValue: string;
};

// Legacy CTR ciphertext is base64-encoded and at least 16 bytes (one IV
// block) — i.e. ≥ 22 base64 chars. Anything outside that shape is treated as
// plaintext and encrypted as-is: CTR decrypt has no integrity tag and would
// silently turn a non-ciphertext value into garbage instead of throwing.
const LEGACY_CTR_LOOKS_LIKE_BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;
const LEGACY_CTR_MIN_LENGTH = 22;

const looksLikeLegacyCtrCiphertext = (value: string): boolean =>
  value.length >= LEGACY_CTR_MIN_LENGTH &&
  LEGACY_CTR_LOOKS_LIKE_BASE64_RE.test(value);

@RegisteredInstanceCommand('2.5.0', 1798000006000, { type: 'slow' })
export class EncryptApplicationRegistrationVariableSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    EncryptApplicationRegistrationVariableSlowInstanceCommand.name,
  );

  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  // Registration variables are server-level config — readable by any
  // workspace that installs the parent registration — so they use the
  // instance-scoped versioned envelope (no workspaceId in the HKDF info).
  // Idempotent: the SELECT filter skips rows already in v2 form and rows
  // still in their default '' (unfilled) state.
  async runDataMigration(dataSource: DataSource): Promise<void> {
    let cursor = '00000000-0000-0000-0000-000000000000';

    while (true) {
      const rows: ApplicationRegistrationVariableRow[] = await dataSource.query(
        `SELECT id, "encryptedValue"
           FROM "core"."applicationRegistrationVariable"
          WHERE id > $1
            AND "encryptedValue" <> ''
            AND "encryptedValue" NOT LIKE $2
          ORDER BY id
          LIMIT $3`,
        [cursor, V2_ENCRYPTED_LIKE_PATTERN, BACKFILL_BATCH_SIZE],
      );

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        if (isEncryptedString(row.encryptedValue)) {
          continue;
        }

        let plaintext: PlaintextString;

        if (looksLikeLegacyCtrCiphertext(row.encryptedValue)) {
          try {
            plaintext = this.secretEncryptionService.decrypt(
              row.encryptedValue,
            ) as PlaintextString;
          } catch (error) {
            this.logger.warn(
              `applicationRegistrationVariable row ${row.id} encryptedValue not valid ciphertext; treating as plaintext. ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            plaintext = row.encryptedValue as PlaintextString;
          }
        } else {
          this.logger.warn(
            `applicationRegistrationVariable row ${row.id} encryptedValue is not legacy CTR ciphertext; treating as plaintext.`,
          );
          plaintext = row.encryptedValue as PlaintextString;
        }

        if (!isDefined(plaintext)) {
          continue;
        }

        const encryptedValue =
          this.secretEncryptionService.encryptVersioned(plaintext);

        await dataSource.query(
          `UPDATE "core"."applicationRegistrationVariable"
              SET "encryptedValue" = $2
            WHERE id = $1`,
          [row.id, encryptedValue],
        );
      }

      cursor = rows[rows.length - 1].id;
    }
  }

  // The CHECK constraint accepts unfilled rows ('') and rows in the
  // versioned envelope. The keyId portion is left unconstrained so future
  // ENCRYPTION_KEY rotations do not require a schema migration.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable"
       ADD CONSTRAINT "${ENCRYPTED_VALUE_CHECK_CONSTRAINT_NAME}"
       CHECK ("encryptedValue" = '' OR "encryptedValue" LIKE '${V2_ENCRYPTED_LIKE_PATTERN}')`,
    );
  }

  // Deliberately do NOT decrypt rows on rollback — re-introducing plaintext
  // secrets to the database would be a security regression. Dropping the
  // CHECK constraint is enough; the service can still read the encrypted
  // column whether or not the constraint exists.
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable"
       DROP CONSTRAINT IF EXISTS "${ENCRYPTED_VALUE_CHECK_CONSTRAINT_NAME}"`,
    );
  }
}
