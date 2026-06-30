import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { isEncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/is-encrypted-string.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const BACKFILL_BATCH_SIZE = 500;

const VALUE_CHECK_CONSTRAINT_NAME = 'CHK_applicationVariable_value_encrypted';

const V2_ENCRYPTED_LIKE_PATTERN = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%`;

type ApplicationVariableRow = {
  id: string;
  workspaceId: string;
  value: string;
};

// Encrypts all remaining plaintext non-secret application variable rows
// into the enc:v2 envelope, then tightens the CHECK constraint to require
// encryption for ALL rows (not just isSecret=true ones).
@RegisteredInstanceCommand('2.9.0', 1798400000000, { type: 'slow' })
export class EncryptNonSecretApplicationVariableSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    EncryptNonSecretApplicationVariableSlowInstanceCommand.name,
  );

  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    let cursor = '00000000-0000-0000-0000-000000000000';
    let totalEncrypted = 0;

    while (true) {
      const rows: ApplicationVariableRow[] = await dataSource.query(
        `SELECT id, "workspaceId", "value"
           FROM "core"."applicationVariable"
          WHERE id > $1
            AND "isSecret" = false
            AND "value" <> ''
            AND "value" NOT LIKE $2
          ORDER BY id
          LIMIT $3`,
        [cursor, V2_ENCRYPTED_LIKE_PATTERN, BACKFILL_BATCH_SIZE],
      );

      if (rows.length === 0) {
        break;
      }

      let batchEncrypted = 0;

      for (const row of rows) {
        if (isEncryptedString(row.value)) {
          continue;
        }

        const encryptedValue = this.secretEncryptionService.encryptVersioned(
          row.value as PlaintextString,
          { workspaceId: row.workspaceId },
        );

        await dataSource.query(
          `UPDATE "core"."applicationVariable"
              SET "value" = $2
            WHERE id = $1`,
          [row.id, encryptedValue],
        );

        batchEncrypted++;
      }

      totalEncrypted += batchEncrypted;
      cursor = rows[rows.length - 1].id;

      this.logger.log(
        `Encrypted ${batchEncrypted} non-secret application variables in this batch (${totalEncrypted} total so far)`,
      );
    }

    this.logger.log(
      `Finished encrypting non-secret application variables: ${totalEncrypted} rows encrypted`,
    );
  }

  // Tightens the CHECK constraint: all values must now be either empty
  // or in the enc:v2 envelope, regardless of isSecret.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable"
       DROP CONSTRAINT IF EXISTS "${VALUE_CHECK_CONSTRAINT_NAME}"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable"
       ADD CONSTRAINT "${VALUE_CHECK_CONSTRAINT_NAME}"
       CHECK ("value" = '' OR "value" LIKE '${V2_ENCRYPTED_LIKE_PATTERN}')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable"
       DROP CONSTRAINT IF EXISTS "${VALUE_CHECK_CONSTRAINT_NAME}"`,
    );

    // Restore the original constraint that allowed plaintext for non-secret rows
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable"
       ADD CONSTRAINT "${VALUE_CHECK_CONSTRAINT_NAME}"
       CHECK ("isSecret" = false OR "value" = '' OR "value" LIKE '${V2_ENCRYPTED_LIKE_PATTERN}')`,
    );
  }
}
