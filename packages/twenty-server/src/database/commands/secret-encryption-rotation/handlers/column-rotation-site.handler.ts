import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import {
  type ObjectLiteral,
  type Repository,
  type SelectQueryBuilder,
} from 'typeorm';

import { type SecretEncryptionRotationSiteName } from 'src/database/commands/secret-encryption-rotation/constants/secret-encryption-rotation-site-name.constant';
import {
  SecretEncryptionRotationHandler,
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/interfaces/secret-encryption-rotation-handler.interface';
import { buildCurrentEncryptionKeyIdEnvelopeLikePattern } from 'src/database/commands/secret-encryption-rotation/utils/build-current-encryption-key-id-envelope-like-pattern.util';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

type EntityWithId = ObjectLiteral & { id: string };

export type ColumnRotationSiteConfig<Entity extends EntityWithId> = {
  siteName: SecretEncryptionRotationSiteName;
  repository: Repository<Entity>;
  encryptedColumns: readonly (keyof Entity & string)[];
  isWorkspaceScoped?: boolean;
  extraWhere?: Partial<Entity>;
};

export class ColumnRotationSiteHandler<
  Entity extends EntityWithId = EntityWithId,
> extends SecretEncryptionRotationHandler {
  readonly siteName: SecretEncryptionRotationSiteName;
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
    const currentEnvelopePattern =
      buildCurrentEncryptionKeyIdEnvelopeLikePattern(currentEncryptionKeyId);

    const qb = this.applyExtraWhere(
      this.config.repository.createQueryBuilder('row'),
    );

    const orClause = this.config.encryptedColumns
      .map((encryptedColumn) => `row.${encryptedColumn} NOT LIKE :p`)
      .join(' OR ');

    qb.andWhere(`(${orClause})`, { p: currentEnvelopePattern });

    return qb.getCount();
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
    encryptedColumn: keyof Entity & string;
  }): Promise<SecretEncryptionRotationOutcome> {
    const outcome: SecretEncryptionRotationOutcome = {
      rotated: 0,
      skipped: 0,
      errors: 0,
    };
    const currentEnvelopePattern =
      buildCurrentEncryptionKeyIdEnvelopeLikePattern(currentEncryptionKeyId);
    let cursor = ZERO_UUID;

    while (true) {
      const qb = this.applyExtraWhere(
        this.config.repository.createQueryBuilder('row'),
      );

      const rows = await qb
        .andWhere('row.id > :cursor', { cursor })
        .andWhere(`row.${encryptedColumn} NOT LIKE :p`, {
          p: currentEnvelopePattern,
        })
        .orderBy('row.id', 'ASC')
        .take(batchSize)
        .getMany();

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

      cursor = rows[rows.length - 1].id;
    }

    return outcome;
  }

  private async rotateRow({
    row,
    encryptedColumn,
    dryRun,
  }: {
    row: Entity;
    encryptedColumn: keyof Entity & string;
    dryRun: boolean;
  }): Promise<SecretEncryptionRotationOutcome> {
    const rowId = row.id;
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
        const setValues = { [encryptedColumn]: reEncrypted } as Partial<Entity>;
        const updateResult = await this.config.repository
          .createQueryBuilder()
          .update()
          .set(setValues)
          .where('id = :rowId', { rowId })
          .andWhere(`${encryptedColumn} = :currentValue`, { currentValue })
          .execute();

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

  private applyExtraWhere(
    qb: SelectQueryBuilder<Entity>,
  ): SelectQueryBuilder<Entity> {
    if (!isDefined(this.config.extraWhere)) {
      return qb;
    }

    for (const [column, value] of Object.entries(this.config.extraWhere)) {
      const parameterKey = `extra_${column}`;
      qb.andWhere(`row.${column} = :${parameterKey}`, {
        [parameterKey]: value,
      });
    }

    return qb;
  }
}
