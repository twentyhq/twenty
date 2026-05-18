import { isDefined } from 'twenty-shared/utils';
import { DataSource, QueryRunner } from 'typeorm';

import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

const BACKFILL_BATCH_SIZE = 500;

const ACCESS_TOKEN_CHECK_CONSTRAINT_NAME =
  'CHK_connectedAccount_accessToken_encrypted';
const REFRESH_TOKEN_CHECK_CONSTRAINT_NAME =
  'CHK_connectedAccount_refreshToken_encrypted';

const V2_ENCRYPTED_LIKE_PATTERN = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%`;

type ConnectedAccountTokenRow = {
  id: string;
  workspaceId: string;
  accessToken: string | null;
  refreshToken: string | null;
};

const isPlaintext = (value: string | null): value is string =>
  isDefined(value) && !value.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX);

@RegisteredInstanceCommand('2.5.0', 1798000004000, { type: 'slow' })
export class EncryptConnectedAccountTokensSlowInstanceCommand
  implements SlowInstanceCommand
{
  constructor(
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
  ) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    let cursor = '00000000-0000-0000-0000-000000000000';

    while (true) {
      const rows: ConnectedAccountTokenRow[] = await dataSource.query(
        `SELECT id, "workspaceId", "accessToken", "refreshToken"
           FROM "core"."connectedAccount"
          WHERE id > $1
            AND (
                  ("accessToken"  IS NOT NULL AND "accessToken"  NOT LIKE $2)
               OR ("refreshToken" IS NOT NULL AND "refreshToken" NOT LIKE $2)
            )
          ORDER BY id
          LIMIT $3`,
        [cursor, V2_ENCRYPTED_LIKE_PATTERN, BACKFILL_BATCH_SIZE],
      );

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        const sets: string[] = [];
        const params: unknown[] = [row.id];

        if (isPlaintext(row.accessToken)) {
          params.push(
            this.connectedAccountTokenEncryptionService.encrypt({
              plaintext: row.accessToken,
              workspaceId: row.workspaceId,
            }),
          );
          sets.push(`"accessToken" = $${params.length}`);
        }

        if (isPlaintext(row.refreshToken)) {
          params.push(
            this.connectedAccountTokenEncryptionService.encrypt({
              plaintext: row.refreshToken,
              workspaceId: row.workspaceId,
            }),
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
       CHECK ("accessToken" IS NULL OR "accessToken" LIKE '${V2_ENCRYPTED_LIKE_PATTERN}')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       ADD CONSTRAINT "${REFRESH_TOKEN_CHECK_CONSTRAINT_NAME}"
       CHECK ("refreshToken" IS NULL OR "refreshToken" LIKE '${V2_ENCRYPTED_LIKE_PATTERN}')`,
    );
  }

  // Deliberately do NOT decrypt rows on rollback — re-introducing plaintext
  // tokens to the database would be a security regression. Dropping the
  // CHECK constraints is enough; ConnectedAccountTokenEncryptionService can
  // still read the encrypted columns whether or not the constraints exist.
  public async down(queryRunner: QueryRunner): Promise<void> {
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
