import { isDefined } from 'twenty-shared/utils';
import { DataSource, QueryRunner } from 'typeorm';

import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const BACKFILL_BATCH_SIZE = 200;

const PRIVATE_KEY_CHECK_CONSTRAINT_NAME = 'CHK_signingKey_privateKey_encrypted';

const V2_ENCRYPTED_LIKE_PATTERN = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%`;

type SigningKeyRow = {
  id: string;
  privateKey: string;
};

@RegisteredInstanceCommand('2.5.0', 1798000007000, { type: 'slow' })
export class EncryptSigningKeyPrivateKeysSlowInstanceCommand
  implements SlowInstanceCommand
{
  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  // Signing keys are instance-scoped — every workspace shares the JWKS — so
  // the versioned envelope uses no workspaceId in its HKDF info. The
  // SELECT filter skips already-migrated rows (idempotent re-runs) and
  // NULL privateKey rows (typically revoked or rotated keys).
  async runDataMigration(dataSource: DataSource): Promise<void> {
    let cursor = '00000000-0000-0000-0000-000000000000';

    while (true) {
      const rows: SigningKeyRow[] = await dataSource.query(
        `SELECT id, "privateKey"
           FROM "core"."signingKey"
          WHERE id > $1
            AND "privateKey" IS NOT NULL
            AND "privateKey" NOT LIKE $2
          ORDER BY id
          LIMIT $3`,
        [cursor, V2_ENCRYPTED_LIKE_PATTERN, BACKFILL_BATCH_SIZE],
      );

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        const plaintext = this.secretEncryptionService.decryptVersioned(
          row.privateKey,
        );

        if (!isDefined(plaintext)) {
          continue;
        }

        const encryptedPrivateKey =
          this.secretEncryptionService.encryptVersioned(plaintext);

        await dataSource.query(
          `UPDATE "core"."signingKey"
              SET "privateKey" = $2
            WHERE id = $1`,
          [row.id, encryptedPrivateKey],
        );
      }

      cursor = rows[rows.length - 1].id;
    }
  }

  // The CHECK constraint admits two states: NULL (revoked keys whose
  // private material has been purged) or the versioned envelope.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."signingKey"
       ADD CONSTRAINT "${PRIVATE_KEY_CHECK_CONSTRAINT_NAME}"
       CHECK ("privateKey" IS NULL OR "privateKey" LIKE '${V2_ENCRYPTED_LIKE_PATTERN}')`,
    );
  }

  // Deliberately do NOT decrypt rows on rollback — re-introducing
  // plaintext private keys would be a severe security regression.
  // Dropping the CHECK constraint is enough; JwtKeyManagerService can
  // still read the encrypted column whether or not the constraint exists.
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."signingKey"
       DROP CONSTRAINT IF EXISTS "${PRIVATE_KEY_CHECK_CONSTRAINT_NAME}"`,
    );
  }
}
