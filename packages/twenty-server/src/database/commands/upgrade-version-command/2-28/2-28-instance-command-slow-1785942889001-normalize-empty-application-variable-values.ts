import { DataSource } from 'typeorm';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const BACKFILL_BATCH_SIZE = 500;

const V2_ENCRYPTED_LIKE_PATTERN = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%`;

type EncryptedVariableRow = {
  id: string;
  encryptedValue: string;
  workspaceId: string | null;
};

@RegisteredInstanceCommand('2.28.0', 1785942889001, { type: 'slow' })
export class NormalizeEmptyApplicationVariableValuesSlowInstanceCommand
  implements SlowInstanceCommand
{
  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  // Data-only: the columns this rewrites already exist.
  public async up(): Promise<void> {}

  // Deliberately not reversible: re-encrypting the empty strings would restore
  // rows that wrongly read as filled, which is the state being repaired.
  public async down(): Promise<void> {}

  // Clearing a variable used to encrypt the empty string into a full envelope,
  // so `isFilled` stayed true and the row kept counting as configured. '' is
  // now the unset sentinel, so rewrite the legacy envelopes that decrypt to it.
  // Idempotent: rows already holding '' are excluded by the SELECT filter.
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await this.normalizeTable({
      dataSource,
      tableName: 'applicationRegistrationVariable',
      valueColumnName: 'encryptedValue',
      isWorkspaceScoped: false,
    });

    await this.normalizeTable({
      dataSource,
      tableName: 'applicationVariable',
      valueColumnName: 'value',
      isWorkspaceScoped: true,
    });
  }

  private async normalizeTable({
    dataSource,
    tableName,
    valueColumnName,
    isWorkspaceScoped,
  }: {
    dataSource: DataSource;
    tableName: string;
    valueColumnName: string;
    isWorkspaceScoped: boolean;
  }): Promise<void> {
    let cursor = '00000000-0000-0000-0000-000000000000';

    while (true) {
      const rows: EncryptedVariableRow[] = await dataSource.query(
        `SELECT id,
                "${valueColumnName}" AS "encryptedValue",
                ${isWorkspaceScoped ? '"workspaceId"' : 'NULL'} AS "workspaceId"
           FROM "core"."${tableName}"
          WHERE id > $1
            AND "${valueColumnName}" LIKE $2
          ORDER BY id
          LIMIT $3`,
        [cursor, V2_ENCRYPTED_LIKE_PATTERN, BACKFILL_BATCH_SIZE],
      );

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        if (!this.decryptsToEmptyString(row)) {
          continue;
        }

        await dataSource.query(
          `UPDATE "core"."${tableName}"
              SET "${valueColumnName}" = ''
            WHERE id = $1`,
          [row.id],
        );
      }

      cursor = rows[rows.length - 1].id;
    }
  }

  private decryptsToEmptyString({
    encryptedValue,
    workspaceId,
  }: EncryptedVariableRow): boolean {
    try {
      return (
        this.secretEncryptionService.decryptVersionedOrThrow(
          encryptedValue as EncryptedString,
          workspaceId === null ? {} : { workspaceId },
        ) === ''
      );
    } catch {
      return false;
    }
  }
}
