import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral, type Repository } from 'typeorm';

import {
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import {
  ANY_V2_ENVELOPE_LIKE_PATTERN,
  buildPrimaryEncryptionKeyIdEnvelopeLikePattern,
} from 'src/database/commands/secret-encryption-rotation/utils/build-non-current-encryption-key-id-like-pattern.util';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';
const ROW_ALIAS = 'row';

@Injectable()
export class SecretEncryptionColumnRotationService {
  private readonly logger = new Logger(
    SecretEncryptionColumnRotationService.name,
  );

  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async countNonCurrentRows<Entity extends ObjectLiteral>({
    repository,
    primaryEncryptionKeyId,
    encryptedColumns,
    extraWhereSql,
  }: {
    repository: Repository<Entity>;
    primaryEncryptionKeyId: string;
    encryptedColumns: string[];
    extraWhereSql?: string;
  }): Promise<number> {
    const primaryPattern = buildPrimaryEncryptionKeyIdEnvelopeLikePattern(
      primaryEncryptionKeyId,
    );

    const orClauses = encryptedColumns
      .map(
        (column) =>
          `(${ROW_ALIAS}."${column}" LIKE :anyV2 AND ${ROW_ALIAS}."${column}" NOT LIKE :primary)`,
      )
      .join(' OR ');

    const queryBuilder = repository
      .createQueryBuilder(ROW_ALIAS)
      .where(`(${orClauses})`, {
        anyV2: ANY_V2_ENVELOPE_LIKE_PATTERN,
        primary: primaryPattern,
      });

    if (isDefined(extraWhereSql)) {
      queryBuilder.andWhere(extraWhereSql);
    }

    return queryBuilder.getCount();
  }

  async rotateColumn<Entity extends ObjectLiteral>({
    repository,
    siteName,
    encryptedColumn,
    workspaceIdColumn,
    extraWhereSql,
    primaryEncryptionKeyId,
    batchSize,
    dryRun,
  }: SecretEncryptionRotationContext & {
    repository: Repository<Entity>;
    siteName: string;
    encryptedColumn: string;
    workspaceIdColumn?: string;
    extraWhereSql?: string;
  }): Promise<SecretEncryptionRotationOutcome> {
    let rotated = 0;
    let skipped = 0;
    let errors = 0;
    let cursor = ZERO_UUID;

    while (true) {
      const queryBuilder = repository
        .createQueryBuilder(ROW_ALIAS)
        .where(
          `${ROW_ALIAS}."${encryptedColumn}" LIKE :anyV2 AND ${ROW_ALIAS}."${encryptedColumn}" NOT LIKE :primary`,
          {
            anyV2: ANY_V2_ENVELOPE_LIKE_PATTERN,
            primary: buildPrimaryEncryptionKeyIdEnvelopeLikePattern(
              primaryEncryptionKeyId,
            ),
          },
        )
        .andWhere(`${ROW_ALIAS}.id > :cursor`, { cursor })
        .orderBy(`${ROW_ALIAS}.id`, 'ASC')
        .limit(batchSize)
        .select([`${ROW_ALIAS}.id`, `${ROW_ALIAS}."${encryptedColumn}"`]);

      if (isDefined(extraWhereSql)) {
        queryBuilder.andWhere(extraWhereSql);
      }

      if (isDefined(workspaceIdColumn)) {
        queryBuilder.addSelect(`${ROW_ALIAS}."${workspaceIdColumn}"`);
      }

      const rows =
        await queryBuilder.getRawMany<Record<string, string | null>>();

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        const rowId = row[`${ROW_ALIAS}_id`] as string;
        const currentValue = row[`${ROW_ALIAS}_${encryptedColumn}`];
        const workspaceId = isDefined(workspaceIdColumn)
          ? (row[`${ROW_ALIAS}_${workspaceIdColumn}`] as string | null)
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

          const plaintext = this.secretEncryptionService.decryptVersioned(
            currentValue,
            cryptoOptions,
          );

          const reEncrypted = this.secretEncryptionService.encryptVersioned(
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
          this.logger.warn(
            `[${siteName}] failed to re-encrypt row ${rowId}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      const lastRow = rows[rows.length - 1];

      cursor = lastRow[`${ROW_ALIAS}_id`] as string;
    }

    return { rotated, skipped, errors };
  }
}
