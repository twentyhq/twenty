import { type Logger } from '@nestjs/common';

import { type DataSource } from 'typeorm';

import {
  ANY_V2_ENVELOPE_LIKE_PATTERN,
  buildPrimaryKeyIdEnvelopeLikePattern,
} from 'src/database/commands/secret-encryption-rotation/utils/build-non-current-keyid-like-pattern.util';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

type Row = {
  id: string;
  value: string | null;
  workspaceId?: string;
};

// Rotates a single varchar column whose values are stored as v2 envelopes.
// The handler stays site-agnostic and idempotent: rows already on the
// primary key are filtered out at the SQL level, so re-running the command
// resumes from where it left off without re-rotating earlier rows.
export const rotateSingleVarcharColumn = async ({
  dataSource,
  secretEncryptionService,
  logger,
  siteName,
  schema,
  table,
  column,
  workspaceIdColumn,
  primaryKeyId,
  batchSize,
  dryRun,
  extraWhereClause,
}: {
  dataSource: DataSource;
  secretEncryptionService: SecretEncryptionService;
  logger: Logger;
  siteName: string;
  schema: string;
  table: string;
  column: string;
  workspaceIdColumn?: string;
  primaryKeyId: string;
  batchSize: number;
  dryRun: boolean;
  extraWhereClause?: string;
}): Promise<{ rotated: number; skipped: number; errors: number }> => {
  const primaryPattern = buildPrimaryKeyIdEnvelopeLikePattern(primaryKeyId);
  const extraWhere = extraWhereClause ? ` AND ${extraWhereClause}` : '';

  let rotated = 0;
  let skipped = 0;
  let errors = 0;
  let cursor = '00000000-0000-0000-0000-000000000000';

  while (true) {
    const selectClause = workspaceIdColumn
      ? `id, "${workspaceIdColumn}" AS "workspaceId", "${column}" AS "value"`
      : `id, "${column}" AS "value"`;

    const rows: Row[] = await dataSource.query(
      `SELECT ${selectClause}
         FROM "${schema}"."${table}"
        WHERE id > $1
          AND "${column}" LIKE $2
          AND "${column}" NOT LIKE $3
          ${extraWhere}
        ORDER BY id
        LIMIT $4`,
      [cursor, ANY_V2_ENVELOPE_LIKE_PATTERN, primaryPattern, batchSize],
    );

    if (rows.length === 0) {
      break;
    }

    for (const row of rows) {
      const currentValue = row.value;

      if (currentValue === null) {
        skipped++;
        continue;
      }

      if (!currentValue.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)) {
        skipped++;
        continue;
      }

      try {
        const plaintext = secretEncryptionService.decryptVersioned(
          currentValue,
          workspaceIdColumn ? { workspaceId: row.workspaceId } : {},
        );

        const reEncrypted = secretEncryptionService.encryptVersioned(
          plaintext,
          workspaceIdColumn ? { workspaceId: row.workspaceId } : {},
        );

        if (!dryRun) {
          await dataSource.query(
            `UPDATE "${schema}"."${table}"
                SET "${column}" = $2
              WHERE id = $1`,
            [row.id, reEncrypted],
          );
        }

        rotated++;
      } catch (error) {
        errors++;
        logger.warn(
          `[${siteName}] failed to re-encrypt row ${row.id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    cursor = rows[rows.length - 1].id;
  }

  return { rotated, skipped, errors };
};
