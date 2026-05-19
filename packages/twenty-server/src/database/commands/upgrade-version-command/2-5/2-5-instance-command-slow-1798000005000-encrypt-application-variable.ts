import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { DataSource, QueryRunner } from 'typeorm';

import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const BACKFILL_BATCH_SIZE = 500;

const VALUE_CHECK_CONSTRAINT_NAME = 'CHK_applicationVariable_value_encrypted';

const V2_ENCRYPTED_LIKE_PATTERN = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%`;

// Legacy CTR ciphertext is base64-encoded and at least 16 bytes (one IV
// block) — i.e. ≥ 22 base64 chars. Anything outside that shape is plaintext.
// Node's `Buffer.from(value, 'base64')` silently skips invalid chars, so a
// URL like `https://hooks.slack.com/...` would otherwise decode into enough
// bytes to "decrypt" to garbage without throwing.
const LEGACY_CTR_LOOKS_LIKE_BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;
const LEGACY_CTR_MIN_LENGTH = 22;

type ApplicationVariableRow = {
  id: string;
  workspaceId: string;
  value: string;
  isSecret: boolean;
};

const looksLikeLegacyCtrCiphertext = (value: string): boolean =>
  value.length >= LEGACY_CTR_MIN_LENGTH &&
  LEGACY_CTR_LOOKS_LIKE_BASE64_RE.test(value);

@RegisteredInstanceCommand('2.5.0', 1798000005000, { type: 'slow' })
export class EncryptApplicationVariableSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    EncryptApplicationVariableSlowInstanceCommand.name,
  );

  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  // Re-encrypts secret application variables into the v2 envelope. Rows
  // marked isSecret=true with a plaintext value (instead of legacy CTR
  // ciphertext) are treated as plaintext and encrypted, mirroring
  // EncryptConnectedAccountTokensSlowInstanceCommand.
  async runDataMigration(dataSource: DataSource): Promise<void> {
    let cursor = '00000000-0000-0000-0000-000000000000';

    while (true) {
      const rows: ApplicationVariableRow[] = await dataSource.query(
        `SELECT id, "workspaceId", "value", "isSecret"
           FROM "core"."applicationVariable"
          WHERE id > $1
            AND "isSecret" = true
            AND "value" <> ''
            AND "value" NOT LIKE $2
          ORDER BY id
          LIMIT $3`,
        [cursor, V2_ENCRYPTED_LIKE_PATTERN, BACKFILL_BATCH_SIZE],
      );

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        if (!row.isSecret) {
          continue;
        }

        let plaintext: string;

        if (looksLikeLegacyCtrCiphertext(row.value)) {
          try {
            plaintext = this.secretEncryptionService.decryptVersioned(
              row.value,
              { workspaceId: row.workspaceId },
            );
          } catch (error) {
            this.logger.warn(
              `applicationVariable row ${row.id} value not valid ciphertext; treating as plaintext. ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            plaintext = row.value;
          }
        } else {
          this.logger.warn(
            `applicationVariable row ${row.id} value is not base64; treating as plaintext.`,
          );
          plaintext = row.value;
        }

        if (!isDefined(plaintext)) {
          continue;
        }

        const encryptedValue = this.secretEncryptionService.encryptVersioned(
          plaintext,
          { workspaceId: row.workspaceId },
        );

        await dataSource.query(
          `UPDATE "core"."applicationVariable"
              SET "value" = $2
            WHERE id = $1`,
          [row.id, encryptedValue],
        );
      }

      cursor = rows[rows.length - 1].id;
    }
  }

  // The CHECK constraint accepts three cases:
  //   1. Non-secret rows (plaintext value, possibly empty)
  //   2. Empty secret rows (uninitialised — value defaults to '')
  //   3. Secret rows in the versioned envelope
  // It is intentionally not strict on the keyId so future key rotations,
  // which change the keyId but keep the envelope shape, do not require a
  // schema migration.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable"
       ADD CONSTRAINT "${VALUE_CHECK_CONSTRAINT_NAME}"
       CHECK ("isSecret" = false OR "value" = '' OR "value" LIKE '${V2_ENCRYPTED_LIKE_PATTERN}')`,
    );
  }

  // Deliberately do NOT decrypt rows on rollback — re-introducing plaintext
  // secrets to the database would be a security regression. Dropping the
  // CHECK constraint is enough; ApplicationVariableEntityService can still
  // read the encrypted column whether or not the constraint exists.
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable"
       DROP CONSTRAINT IF EXISTS "${VALUE_CHECK_CONSTRAINT_NAME}"`,
    );
  }
}
