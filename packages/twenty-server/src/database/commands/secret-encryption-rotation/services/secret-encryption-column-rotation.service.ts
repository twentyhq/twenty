import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import {
  type FindOptionsOrder,
  type FindOptionsWhere,
  MoreThan,
  type ObjectLiteral,
  type Repository,
} from 'typeorm';

import {
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/interfaces/secret-encryption-rotation-handler.interface';
import { buildNonCurrentEnvelopeRawFilter } from 'src/database/commands/secret-encryption-rotation/utils/build-current-encryption-key-id-envelope-like-pattern.util';
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
    const nonCurrentEnvelopeFilter = buildNonCurrentEnvelopeRawFilter(
      currentEncryptionKeyId,
    );

    const where = encryptedColumns.map(
      (encryptedColumn) =>
        ({
          ...extraWhere,
          [encryptedColumn]: nonCurrentEnvelopeFilter,
        }) as unknown as FindOptionsWhere<Entity>,
    );

    return repository.count({ where });
  }

  async rotateColumn<Entity extends ObjectLiteral>({
    repository,
    siteName,
    encryptedColumn,
    isWorkspaceScoped,
    extraWhere,
    currentEncryptionKeyId,
    batchSize,
    dryRun,
  }: SecretEncryptionRotationContext & {
    repository: Repository<Entity>;
    siteName: string;
    encryptedColumn: string;
    isWorkspaceScoped?: boolean;
    extraWhere?: FindOptionsWhere<Entity>;
  }): Promise<SecretEncryptionRotationOutcome> {
    const outcome: SecretEncryptionRotationOutcome = {
      rotated: 0,
      skipped: 0,
      errors: 0,
    };
    let cursor: string = ZERO_UUID;
    const nonCurrentEnvelopeFilter = buildNonCurrentEnvelopeRawFilter(
      currentEncryptionKeyId,
    );

    while (true) {
      const rows = await repository.find({
        where: {
          ...extraWhere,
          id: MoreThan(cursor),
          [encryptedColumn]: nonCurrentEnvelopeFilter,
        } as unknown as FindOptionsWhere<Entity>,
        order: { id: 'ASC' } as unknown as FindOptionsOrder<Entity>,
        take: batchSize,
      });

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        const rowOutcome = await this.rotateRow({
          repository,
          row,
          encryptedColumn,
          isWorkspaceScoped: isWorkspaceScoped ?? false,
          siteName,
          dryRun,
        });

        outcome.rotated += rowOutcome.rotated;
        outcome.skipped += rowOutcome.skipped;
        outcome.errors += rowOutcome.errors;
      }

      cursor = rows[rows.length - 1].id as string;
    }

    return outcome;
  }

  private async rotateRow<Entity extends ObjectLiteral>({
    repository,
    row,
    encryptedColumn,
    isWorkspaceScoped,
    siteName,
    dryRun,
  }: {
    repository: Repository<Entity>;
    row: Entity;
    encryptedColumn: string;
    isWorkspaceScoped: boolean;
    siteName: string;
    dryRun: boolean;
  }): Promise<SecretEncryptionRotationOutcome> {
    const rowId = row.id as string;
    const currentValue = row[encryptedColumn] as string | null | undefined;

    if (
      !isDefined(currentValue) ||
      !currentValue.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)
    ) {
      return { rotated: 0, skipped: 1, errors: 0 };
    }

    const cryptoOptions = isWorkspaceScoped
      ? { workspaceId: row.workspaceId as string }
      : undefined;

    try {
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
          return { rotated: 0, skipped: 1, errors: 0 };
        }
      }

      return { rotated: 1, skipped: 0, errors: 0 };
    } catch (error) {
      this.logger.warn(
        `[${siteName}] failed to re-encrypt row ${rowId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return { rotated: 0, skipped: 0, errors: 1 };
    }
  }
}
