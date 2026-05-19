import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import {
  type FindOptionsOrder,
  type FindOptionsSelect,
  type FindOptionsWhere,
  MoreThan,
  type ObjectLiteral,
  Raw,
  type Repository,
} from 'typeorm';

import {
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import {
  ANY_V2_ENVELOPE_LIKE_PATTERN,
  buildCurrentEncryptionKeyIdEnvelopeLikePattern,
} from 'src/database/commands/secret-encryption-rotation/utils/build-current-encryption-key-id-envelope-like-pattern.util';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

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
    currentEncryptionKeyId,
    encryptedColumns,
    extraWhere,
  }: {
    repository: Repository<Entity>;
    currentEncryptionKeyId: string;
    encryptedColumns: string[];
    extraWhere?: FindOptionsWhere<Entity>;
  }): Promise<number> {
    const nonCurrentEnvelopeFilter = this.buildNonCurrentEnvelopeRawFilter(
      currentEncryptionKeyId,
    );

    const where = encryptedColumns.map(
      (encryptedColumn) =>
        ({
          ...extraWhere,
          [encryptedColumn]: nonCurrentEnvelopeFilter,
        }) as FindOptionsWhere<Entity>,
    );

    return repository.count({ where });
  }

  async rotateColumn<Entity extends ObjectLiteral>({
    repository,
    siteName,
    encryptedColumn,
    workspaceIdColumn,
    extraWhere,
    currentEncryptionKeyId,
    batchSize,
    dryRun,
  }: SecretEncryptionRotationContext & {
    repository: Repository<Entity>;
    siteName: string;
    encryptedColumn: string;
    workspaceIdColumn?: string;
    extraWhere?: FindOptionsWhere<Entity>;
  }): Promise<SecretEncryptionRotationOutcome> {
    let rotated = 0;
    let skipped = 0;
    let errors = 0;
    let cursor: string = ZERO_UUID;

    const select = {
      id: true,
      [encryptedColumn]: true,
      ...(isDefined(workspaceIdColumn) ? { [workspaceIdColumn]: true } : {}),
    } as unknown as FindOptionsSelect<Entity>;

    while (true) {
      const where = {
        ...extraWhere,
        id: MoreThan(cursor),
        [encryptedColumn]: this.buildNonCurrentEnvelopeRawFilter(
          currentEncryptionKeyId,
        ),
      } as unknown as FindOptionsWhere<Entity>;

      const rows = await repository.find({
        where,
        order: { id: 'ASC' } as unknown as FindOptionsOrder<Entity>,
        take: batchSize,
        select,
      });

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        const rowId = row.id as string;
        const currentValue = row[encryptedColumn] as string | null | undefined;
        const workspaceId = isDefined(workspaceIdColumn)
          ? (row[workspaceIdColumn] as string | null)
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
            const updateResult = await repository.update(
              {
                id: rowId,
                [encryptedColumn]: currentValue,
              } as unknown as FindOptionsWhere<Entity>,
              { [encryptedColumn]: reEncrypted } as unknown as Parameters<
                Repository<Entity>['update']
              >[1],
            );

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

      cursor = rows[rows.length - 1].id as string;
    }

    return { rotated, skipped, errors };
  }

  private buildNonCurrentEnvelopeRawFilter(currentEncryptionKeyId: string) {
    return Raw<string>(
      (alias) => `${alias} LIKE :anyV2 AND ${alias} NOT LIKE :current`,
      {
        anyV2: ANY_V2_ENVELOPE_LIKE_PATTERN,
        current: buildCurrentEncryptionKeyIdEnvelopeLikePattern(
          currentEncryptionKeyId,
        ),
      },
    );
  }
}
