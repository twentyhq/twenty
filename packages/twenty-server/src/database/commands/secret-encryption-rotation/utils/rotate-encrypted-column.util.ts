import { type Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral, type Repository } from 'typeorm';

import {
  ANY_V2_ENVELOPE_LIKE_PATTERN,
  buildPrimaryKeyIdEnvelopeLikePattern,
} from 'src/database/commands/secret-encryption-rotation/utils/build-non-current-keyid-like-pattern.util';
import {
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

type EncryptedColumnFilter = {
  encryptedColumn: string;
  workspaceIdColumn?: string;
  extraWhereSql?: string;
};

const applyEncryptedColumnFilter = <Entity extends ObjectLiteral>({
  repository,
  alias,
  primaryKeyId,
  encryptedColumn,
  extraWhereSql,
}: {
  repository: Repository<Entity>;
  alias: string;
  primaryKeyId: string;
  encryptedColumn: string;
  extraWhereSql?: string;
}) => {
  const queryBuilder = repository
    .createQueryBuilder(alias)
    .where(
      `${alias}."${encryptedColumn}" LIKE :anyV2 AND ${alias}."${encryptedColumn}" NOT LIKE :primary`,
      {
        anyV2: ANY_V2_ENVELOPE_LIKE_PATTERN,
        primary: buildPrimaryKeyIdEnvelopeLikePattern(primaryKeyId),
      },
    );

  if (isDefined(extraWhereSql)) {
    queryBuilder.andWhere(extraWhereSql);
  }

  return queryBuilder;
};

export const countEncryptedColumnNonCurrentRows = async <
  Entity extends ObjectLiteral,
>({
  repository,
  primaryKeyId,
  encryptedColumns,
  extraWhereSql,
}: {
  repository: Repository<Entity>;
  primaryKeyId: string;
  encryptedColumns: string[];
  extraWhereSql?: string;
}): Promise<number> => {
  const alias = 'row';
  const primaryPattern = buildPrimaryKeyIdEnvelopeLikePattern(primaryKeyId);

  const orClauses = encryptedColumns
    .map(
      (column) =>
        `(${alias}."${column}" LIKE :anyV2 AND ${alias}."${column}" NOT LIKE :primary)`,
    )
    .join(' OR ');

  const queryBuilder = repository
    .createQueryBuilder(alias)
    .where(`(${orClauses})`, {
      anyV2: ANY_V2_ENVELOPE_LIKE_PATTERN,
      primary: primaryPattern,
    });

  if (isDefined(extraWhereSql)) {
    queryBuilder.andWhere(extraWhereSql);
  }

  return queryBuilder.getCount();
};

export const rotateEncryptedColumn = async <Entity extends ObjectLiteral>({
  repository,
  primaryKeyId,
  encryptedColumn,
  workspaceIdColumn,
  extraWhereSql,
  batchSize,
  dryRun,
  secretEncryptionService,
  logger,
  siteName,
}: EncryptedColumnFilter &
  SecretEncryptionRotationContext & {
    repository: Repository<Entity>;
    secretEncryptionService: SecretEncryptionService;
    logger: Logger;
    siteName: string;
  }): Promise<SecretEncryptionRotationOutcome> => {
  const alias = 'row';

  let rotated = 0;
  let skipped = 0;
  let errors = 0;
  let cursor = ZERO_UUID;

  while (true) {
    const queryBuilder = applyEncryptedColumnFilter({
      repository,
      alias,
      primaryKeyId,
      encryptedColumn,
      extraWhereSql,
    })
      .andWhere(`${alias}.id > :cursor`, { cursor })
      .orderBy(`${alias}.id`, 'ASC')
      .limit(batchSize)
      .select([`${alias}.id`, `${alias}."${encryptedColumn}"`]);

    if (isDefined(workspaceIdColumn)) {
      queryBuilder.addSelect(`${alias}."${workspaceIdColumn}"`);
    }

    const rows = await queryBuilder.getRawMany<Record<string, string | null>>();

    if (rows.length === 0) {
      break;
    }

    for (const row of rows) {
      const rowId = row[`${alias}_id`] as string;
      const currentValue = row[`${alias}_${encryptedColumn}`];
      const workspaceId = isDefined(workspaceIdColumn)
        ? (row[`${alias}_${workspaceIdColumn}`] as string | null)
        : undefined;

      if (!isDefined(currentValue)) {
        skipped++;
        continue;
      }

      if (!currentValue.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)) {
        skipped++;
        continue;
      }

      try {
        const cryptoOptions = isDefined(workspaceId)
          ? { workspaceId }
          : undefined;

        const plaintext = secretEncryptionService.decryptVersioned(
          currentValue,
          cryptoOptions,
        );

        const reEncrypted = secretEncryptionService.encryptVersioned(
          plaintext,
          cryptoOptions,
        );

        if (!dryRun) {
          const updateResult = await repository
            .createQueryBuilder()
            .update()
            .set({ [encryptedColumn]: reEncrypted } as Partial<Entity>)
            .where('id = :id', { id: rowId })
            .andWhere(`"${encryptedColumn}" = :originalValue`, {
              originalValue: currentValue,
            })
            .execute();

          if ((updateResult.affected ?? 0) === 0) {
            skipped++;
            continue;
          }
        }

        rotated++;
      } catch (error) {
        errors++;
        logger.warn(
          `[${siteName}] failed to re-encrypt row ${rowId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    const lastRow = rows[rows.length - 1];

    cursor = lastRow[`${alias}_id`] as string;
  }

  return { rotated, skipped, errors };
};
