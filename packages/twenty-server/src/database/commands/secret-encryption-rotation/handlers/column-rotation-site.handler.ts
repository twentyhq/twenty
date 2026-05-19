import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import {
  type FindOptionsOrder,
  type FindOptionsWhere,
  MoreThan,
  type ObjectLiteral,
  type Repository,
} from 'typeorm';

import {
  SecretEncryptionRotationHandler,
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/interfaces/secret-encryption-rotation-handler.interface';
import { buildNonCurrentEnvelopeRawFilter } from 'src/database/commands/secret-encryption-rotation/utils/build-current-encryption-key-id-envelope-like-pattern.util';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

export type ColumnRotationSiteConfig<Entity extends ObjectLiteral> = {
  siteName: string;
  repository: Repository<Entity>;
  encryptedColumns: string[];
  isWorkspaceScoped?: boolean;
  extraWhere?: FindOptionsWhere<Entity>;
};

export class ColumnRotationSiteHandler<
  Entity extends ObjectLiteral = ObjectLiteral,
> extends SecretEncryptionRotationHandler {
  readonly siteName: string;
  private readonly logger = new Logger(ColumnRotationSiteHandler.name);

  constructor(
    private readonly config: ColumnRotationSiteConfig<Entity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {
    super();
    this.siteName = config.siteName;
  }

  async countRemaining({
    currentEncryptionKeyId,
  }: {
    currentEncryptionKeyId: string;
  }): Promise<number> {
    const nonCurrentEnvelopeFilter = buildNonCurrentEnvelopeRawFilter(
      currentEncryptionKeyId,
    );

    const where = this.config.encryptedColumns.map(
      (encryptedColumn) =>
        ({
          ...this.config.extraWhere,
          [encryptedColumn]: nonCurrentEnvelopeFilter,
        }) as unknown as FindOptionsWhere<Entity>,
    );

    return this.config.repository.count({ where });
  }

  async rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome> {
    const aggregated: SecretEncryptionRotationOutcome = {
      rotated: 0,
      skipped: 0,
      errors: 0,
    };

    for (const encryptedColumn of this.config.encryptedColumns) {
      const outcome = await this.rotateColumn({
        ...context,
        encryptedColumn,
      });

      aggregated.rotated += outcome.rotated;
      aggregated.skipped += outcome.skipped;
      aggregated.errors += outcome.errors;
    }

    return aggregated;
  }

  private async rotateColumn({
    encryptedColumn,
    currentEncryptionKeyId,
    batchSize,
    dryRun,
  }: SecretEncryptionRotationContext & {
    encryptedColumn: string;
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
      const rows = await this.config.repository.find({
        where: {
          ...this.config.extraWhere,
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
          row,
          encryptedColumn,
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

  private async rotateRow({
    row,
    encryptedColumn,
    dryRun,
  }: {
    row: Entity;
    encryptedColumn: string;
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

    const cryptoOptions = this.config.isWorkspaceScoped
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
        const updateResult = await this.config.repository.update(
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
        `[${this.siteName}] failed to re-encrypt row ${rowId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return { rotated: 0, skipped: 0, errors: 1 };
    }
  }
}
