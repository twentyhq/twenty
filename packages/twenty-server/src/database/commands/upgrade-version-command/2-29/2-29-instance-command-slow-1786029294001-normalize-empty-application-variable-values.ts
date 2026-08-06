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

type EncryptedRow = { id: string; encryptedValue: string };

type NormalizationTally = { normalized: number; undecryptable: number };

@RegisteredInstanceCommand('2.29.0', 1786029294001, { type: 'slow' })
export class NormalizeEmptyApplicationVariableValuesSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    NormalizeEmptyApplicationVariableValuesSlowInstanceCommand.name,
  );

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
  // Idempotent: rows already holding '' are excluded by the LIKE filter.
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await this.normalizeApplicationRegistrationVariables(dataSource);
    await this.normalizeApplicationVariables(dataSource);
  }

  private async normalizeApplicationRegistrationVariables(
    dataSource: DataSource,
  ): Promise<void> {
    const tally: NormalizationTally = { normalized: 0, undecryptable: 0 };
    let cursor = FIRST_CURSOR;

    while (true) {
      const rows: EncryptedRow[] = await dataSource.query(
        `SELECT id, "encryptedValue"
           FROM "core"."applicationRegistrationVariable"
          WHERE id > $1
            AND "encryptedValue" LIKE $2
          ORDER BY id
          LIMIT $3`,
        [cursor, V2_ENCRYPTED_LIKE_PATTERN, BACKFILL_BATCH_SIZE],
      );

      if (rows.length === 0) {
        break;
      }

      const rowsToNormalize = this.collectRowsDecryptingToEmptyString({
        rows,
        tally,
      });

      if (rowsToNormalize.length > 0) {
        await dataSource.query(
          `UPDATE "core"."applicationRegistrationVariable" AS target
              SET "encryptedValue" = ''
             FROM (
               SELECT unnest($1::uuid[]) AS id, unnest($2::text[]) AS "encryptedValue"
             ) AS stale
            WHERE target.id = stale.id
              AND target."encryptedValue" = stale."encryptedValue"`,
          [
            rowsToNormalize.map(({ id }) => id),
            rowsToNormalize.map(({ encryptedValue }) => encryptedValue),
          ],
        );
      }

      cursor = rows[rows.length - 1].id;
    }

    this.logTally('applicationRegistrationVariable', tally);
  }

  private async normalizeApplicationVariables(
    dataSource: DataSource,
  ): Promise<void> {
    const tally: NormalizationTally = { normalized: 0, undecryptable: 0 };
    let cursor = FIRST_CURSOR;

    while (true) {
      const rows: (EncryptedRow & { workspaceId: string })[] =
        await dataSource.query(
          `SELECT id, "value" AS "encryptedValue", "workspaceId"
           FROM "core"."applicationVariable"
          WHERE id > $1
            AND "value" LIKE $2
          ORDER BY id
          LIMIT $3`,
          [cursor, V2_ENCRYPTED_LIKE_PATTERN, BACKFILL_BATCH_SIZE],
        );

      if (rows.length === 0) {
        break;
      }

      const rowsToNormalize = this.collectRowsDecryptingToEmptyString({
        rows,
        tally,
      });

      if (rowsToNormalize.length > 0) {
        await dataSource.query(
          `UPDATE "core"."applicationVariable" AS target
              SET "value" = ''
             FROM (
               SELECT unnest($1::uuid[]) AS id, unnest($2::text[]) AS "value"
             ) AS stale
            WHERE target.id = stale.id
              AND target."value" = stale."value"`,
          [
            rowsToNormalize.map(({ id }) => id),
            rowsToNormalize.map(({ encryptedValue }) => encryptedValue),
          ],
        );
      }

      cursor = rows[rows.length - 1].id;
    }

    this.logTally('applicationVariable', tally);
  }

  // Returns the ciphertext alongside the id so the UPDATE can match on it and
  // skip any row an operator filled while this migration was running.
  private collectRowsDecryptingToEmptyString({
    rows,
    tally,
  }: {
    rows: (EncryptedRow & { workspaceId?: string })[];
    tally: NormalizationTally;
  }): EncryptedRow[] {
    const rowsToNormalize: EncryptedRow[] = [];

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
        tally.undecryptable++;
      }
    }

    tally.normalized += rowsToNormalize.length;

    return rowsToNormalize;
  }

  private logTally(tableName: string, tally: NormalizationTally): void {
    this.logger.log(
      `core.${tableName}: normalized ${tally.normalized} empty value(s), skipped ${tally.undecryptable} undecryptable row(s)`,
    );
  }
}
