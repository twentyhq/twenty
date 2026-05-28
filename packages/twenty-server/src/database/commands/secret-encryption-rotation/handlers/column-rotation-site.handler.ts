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
import { buildRotationErrorMessage } from 'src/database/commands/secret-encryption-rotation/utils/build-rotation-error-message.util';
import { isEncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/is-encrypted-string.util';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

type EntityWithId = ObjectLiteral & { id: string };

export type ColumnRotationSiteConfig<Entity extends EntityWithId> = {
  siteName: SecretEncryptionRotationSiteName;
  repository: Repository<Entity>;
  encryptedColumn: keyof Entity & string;
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

    return this.applyExtraWhere(
      this.config.repository.createQueryBuilder('row'),
    )
      .andWhere(`row.${this.config.encryptedColumn} NOT LIKE :p`, {
        p: currentEnvelopePattern,
      })
      .getCount();
  }

  async rotate({
    currentEncryptionKeyId,
    batchSize,
    dryRun,
  }: SecretEncryptionRotationContext): Promise<SecretEncryptionRotationOutcome> {
    const outcome: SecretEncryptionRotationOutcome = {
      rotated: 0,
      skipped: 0,
      errors: 0,
    };
    const currentEnvelopePattern =
      buildCurrentEncryptionKeyIdEnvelopeLikePattern(currentEncryptionKeyId);
    let cursor = ZERO_UUID;

    while (true) {
      const rows = await this.applyExtraWhere(
        this.config.repository.createQueryBuilder('row'),
      )
        .andWhere('row.id > :cursor', { cursor })
        .andWhere(`row.${this.config.encryptedColumn} NOT LIKE :p`, {
          p: currentEnvelopePattern,
        })
        .orderBy('row.id', 'ASC')
        .take(batchSize)
        .getMany();

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        const rowOutcome = await this.rotateRow({ row, dryRun });

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
    dryRun,
  }: {
    row: Entity;
    dryRun: boolean;
  }): Promise<SecretEncryptionRotationOutcome> {
    const { encryptedColumn } = this.config;
    const rowId = row.id;
    const currentValue = row[encryptedColumn] as string | null | undefined;

    if (!isDefined(currentValue) || !isEncryptedString(currentValue)) {
      this.logger.error(
        `[${this.siteName}] row ${rowId}: column '${encryptedColumn}' is not a versioned envelope, refusing to rotate.`,
      );

      return { rotated: 0, skipped: 0, errors: 1 };
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
          .andWhere(`"${encryptedColumn}" = :currentValue`, { currentValue })
          .execute();

        if ((updateResult.affected ?? 0) === 0) {
          return { rotated: 0, skipped: 1, errors: 0 };
        }
      }

      return { rotated: 1, skipped: 0, errors: 0 };
    } catch (error) {
      this.logger.error(buildRotationErrorMessage(this.siteName, rowId, error));

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
