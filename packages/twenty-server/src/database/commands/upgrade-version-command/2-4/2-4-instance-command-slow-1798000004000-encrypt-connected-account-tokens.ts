import { DataSource, QueryRunner } from 'typeorm';

import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX } from 'src/engine/metadata-modules/connected-account/utils/connected-account-token.transformer';

const BACKFILL_BATCH_SIZE = 500;

const ACCESS_TOKEN_CHECK_CONSTRAINT_NAME =
  'CHK_connectedAccount_accessToken_encrypted';
const REFRESH_TOKEN_CHECK_CONSTRAINT_NAME =
  'CHK_connectedAccount_refreshToken_encrypted';

type ConnectedAccountTokenRow = {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
};

@RegisteredInstanceCommand('2.4.0', 1798000004000, { type: 'slow' })
export class EncryptConnectedAccountTokensSlowInstanceCommand
  implements SlowInstanceCommand
{
  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    // Cursor-based pagination so we never load the full table into memory.
    // The loop is resumable: re-running after a partial failure picks up from
    // wherever the last run left off because the SELECT filter excludes rows
    // whose tokens are both already prefixed.
    let cursor = '00000000-0000-0000-0000-000000000000';

    while (true) {
      const rows: ConnectedAccountTokenRow[] = await dataSource.query(
        `SELECT id, "accessToken", "refreshToken"
           FROM "core"."connectedAccount"
          WHERE id > $1
            AND (
                  ("accessToken"  IS NOT NULL AND "accessToken"  NOT LIKE $2)
               OR ("refreshToken" IS NOT NULL AND "refreshToken" NOT LIKE $2)
            )
          ORDER BY id
          LIMIT $3`,
        [
          cursor,
          `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}%`,
          BACKFILL_BATCH_SIZE,
        ],
      );

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        const sets: string[] = [];
        const params: unknown[] = [row.id];
        if (
          row.accessToken !== null &&
          !row.accessToken.startsWith(CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX)
        ) {
          params.push(
            `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}${this.secretEncryptionService.encrypt(row.accessToken)}`,
          );
          sets.push(`"accessToken" = $${params.length}`);
        }

        if (
          row.refreshToken !== null &&
          !row.refreshToken.startsWith(
            CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX,
          )
        ) {
          params.push(
            `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}${this.secretEncryptionService.encrypt(row.refreshToken)}`,
          );
          sets.push(`"refreshToken" = $${params.length}`);
        }

        if (sets.length === 0) {
          continue;
        }

        await dataSource.query(
          `UPDATE "core"."connectedAccount"
              SET ${sets.join(', ')}
            WHERE id = $1`,
          params,
        );
      }

      cursor = rows[rows.length - 1].id;
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       ADD CONSTRAINT "${ACCESS_TOKEN_CHECK_CONSTRAINT_NAME}"
       CHECK ("accessToken" IS NULL OR "accessToken" LIKE '${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}%')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       ADD CONSTRAINT "${REFRESH_TOKEN_CHECK_CONSTRAINT_NAME}"
       CHECK ("refreshToken" IS NULL OR "refreshToken" LIKE '${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}%')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Deliberately do NOT decrypt rows on rollback. Re-introducing plaintext
    // tokens to the database would be a security regression. Dropping the
    // constraint is enough — the entity transformer reads encrypted values
    // transparently regardless of whether the constraint exists.
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       DROP CONSTRAINT IF EXISTS "${REFRESH_TOKEN_CHECK_CONSTRAINT_NAME}"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       DROP CONSTRAINT IF EXISTS "${ACCESS_TOKEN_CHECK_CONSTRAINT_NAME}"`,
    );
  }
}
