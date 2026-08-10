import { Logger } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const BACKFILL_BATCH_SIZE = 500;

const V2_ENCRYPTED_LIKE_PATTERN = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%`;

const FIRST_CURSOR = '00000000-0000-0000-0000-000000000000';

const NORMALIZATION_TARGETS = [
  {
    tableName: 'applicationRegistrationVariable',
    valueColumnName: 'encryptedValue',
    isWorkspaceScoped: false,
  },
  {
    tableName: 'applicationVariable',
    valueColumnName: 'value',
    isWorkspaceScoped: true,
  },
] as const;

type NormalizationTarget = (typeof NORMALIZATION_TARGETS)[number];

type EncryptedRow = {
  id: string;
  encryptedValue: string;
  workspaceId?: string;
};

type NormalizationTally = { normalized: number; undecryptable: number };

@RegisteredInstanceCommand('2.30.0', 1786029294001, { type: 'slow' })
export class NormalizeEmptyApplicationVariableValuesSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    NormalizeEmptyApplicationVariableValuesSlowInstanceCommand.name,
  );

  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  public async up(): Promise<void> {}

  public async down(): Promise<void> {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    for (const normalizationTarget of NORMALIZATION_TARGETS) {
      await this.normalizeTarget(dataSource, normalizationTarget);
    }
  }

  private async normalizeTarget(
    dataSource: DataSource,
    { tableName, valueColumnName, isWorkspaceScoped }: NormalizationTarget,
  ): Promise<void> {
    const tally: NormalizationTally = { normalized: 0, undecryptable: 0 };
    const workspaceIdSelection = isWorkspaceScoped ? ', "workspaceId"' : '';
    let cursor: string = FIRST_CURSOR;

    while (true) {
      const rows: EncryptedRow[] = await dataSource.query(
        `SELECT id, "${valueColumnName}" AS "encryptedValue"${workspaceIdSelection}
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

      const { rowsToNormalize, undecryptableCount } =
        this.collectRowsDecryptingToEmptyString(rows);

      tally.undecryptable += undecryptableCount;

      if (rowsToNormalize.length > 0) {
        tally.normalized += await this.normalizeRows({
          dataSource,
          tableName,
          valueColumnName,
          rowsToNormalize,
        });
      }

      cursor = rows[rows.length - 1].id;
    }

    this.logTally(tableName, tally);
  }

  private async normalizeRows({
    dataSource,
    tableName,
    valueColumnName,
    rowsToNormalize,
  }: {
    dataSource: DataSource;
    tableName: NormalizationTarget['tableName'];
    valueColumnName: NormalizationTarget['valueColumnName'];
    rowsToNormalize: EncryptedRow[];
  }): Promise<number> {
    const countRows: { count: string }[] = await dataSource.query(
      `WITH "normalized" AS (
         UPDATE "core"."${tableName}" AS target
            SET "${valueColumnName}" = ''
           FROM (
             SELECT unnest($1::uuid[]) AS id, unnest($2::text[]) AS "encryptedValue"
           ) AS stale
          WHERE target.id = stale.id
            AND target."${valueColumnName}" = stale."encryptedValue"
         RETURNING target.id
       )
       SELECT COUNT(*) AS "count" FROM "normalized"`,
      [
        rowsToNormalize.map(({ id }) => id),
        rowsToNormalize.map(({ encryptedValue }) => encryptedValue),
      ],
    );

    return Number(countRows[0]?.count ?? 0);
  }

  private collectRowsDecryptingToEmptyString(rows: EncryptedRow[]): {
    rowsToNormalize: EncryptedRow[];
    undecryptableCount: number;
  } {
    const rowsToNormalize: EncryptedRow[] = [];
    let undecryptableCount = 0;

    for (const { id, encryptedValue, workspaceId } of rows) {
      try {
        if (
          this.secretEncryptionService.decryptVersionedOrThrow(
            encryptedValue as EncryptedString,
            { workspaceId },
          ) === ''
        ) {
          rowsToNormalize.push({ id, encryptedValue });
        }
      } catch {
        undecryptableCount++;
      }
    }

    return { rowsToNormalize, undecryptableCount };
  }

  private logTally(
    tableName: NormalizationTarget['tableName'],
    tally: NormalizationTally,
  ): void {
    const message = `core.${tableName}: normalized ${tally.normalized} empty value(s), skipped ${tally.undecryptable} undecryptable row(s)`;

    if (tally.undecryptable > 0) {
      this.logger.warn(message);
    } else {
      this.logger.log(message);
    }
  }
}
