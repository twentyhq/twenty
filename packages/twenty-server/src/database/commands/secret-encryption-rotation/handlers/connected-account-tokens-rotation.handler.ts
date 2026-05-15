import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import {
  type SecretEncryptionRotationHandler,
  type SecretEncryptionRotationHandlerOptions,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import {
  ANY_V2_ENVELOPE_LIKE_PATTERN,
  buildPrimaryKeyIdEnvelopeLikePattern,
} from 'src/database/commands/secret-encryption-rotation/utils/build-non-current-keyid-like-pattern.util';
import { countNonCurrentKeyIdRows } from 'src/database/commands/secret-encryption-rotation/utils/count-non-current-keyid-rows.util';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

type ConnectedAccountTokenRow = {
  id: string;
  workspaceId: string;
  accessToken: string | null;
  refreshToken: string | null;
};

@Injectable()
export class ConnectedAccountTokensRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'connected-account-tokens';
  private readonly logger = new Logger(
    ConnectedAccountTokensRotationHandler.name,
  );

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async countRemaining({
    primaryKeyId,
  }: {
    primaryKeyId: string;
  }): Promise<number> {
    return countNonCurrentKeyIdRows({
      dataSource: this.dataSource,
      schema: 'core',
      table: 'connectedAccount',
      columns: ['accessToken', 'refreshToken'],
      primaryKeyId,
    });
  }

  async run({
    primaryKeyId,
    batchSize,
    dryRun,
  }: SecretEncryptionRotationHandlerOptions): Promise<{
    rotated: number;
    skipped: number;
    errors: number;
  }> {
    const primaryPattern = buildPrimaryKeyIdEnvelopeLikePattern(primaryKeyId);

    let rotated = 0;
    let skipped = 0;
    let errors = 0;
    let cursor = '00000000-0000-0000-0000-000000000000';

    while (true) {
      const rows: ConnectedAccountTokenRow[] = await this.dataSource.query(
        `SELECT id, "workspaceId", "accessToken", "refreshToken"
           FROM "core"."connectedAccount"
          WHERE id > $1
            AND (
                  ("accessToken"  LIKE $2 AND "accessToken"  NOT LIKE $3)
               OR ("refreshToken" LIKE $2 AND "refreshToken" NOT LIKE $3)
            )
          ORDER BY id
          LIMIT $4`,
        [cursor, ANY_V2_ENVELOPE_LIKE_PATTERN, primaryPattern, batchSize],
      );

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        const sets: string[] = [];
        const params: unknown[] = [row.id];

        const accessOutcome = this.tryReEncrypt({
          value: row.accessToken,
          workspaceId: row.workspaceId,
          primaryPattern,
          rowId: row.id,
          column: 'accessToken',
        });
        const refreshOutcome = this.tryReEncrypt({
          value: row.refreshToken,
          workspaceId: row.workspaceId,
          primaryPattern,
          rowId: row.id,
          column: 'refreshToken',
        });

        for (const outcome of [accessOutcome, refreshOutcome]) {
          if (outcome.kind === 'error') errors++;
          if (outcome.kind === 'skipped') skipped++;
        }

        if (accessOutcome.kind === 'rotated') {
          params.push(accessOutcome.value);
          sets.push(`"accessToken" = $${params.length}`);
        }
        if (refreshOutcome.kind === 'rotated') {
          params.push(refreshOutcome.value);
          sets.push(`"refreshToken" = $${params.length}`);
        }

        if (sets.length === 0) {
          continue;
        }

        if (!dryRun) {
          await this.dataSource.query(
            `UPDATE "core"."connectedAccount"
                SET ${sets.join(', ')}
              WHERE id = $1`,
            params,
          );
        }

        rotated += sets.length;
      }

      cursor = rows[rows.length - 1].id;
    }

    return { rotated, skipped, errors };
  }

  private tryReEncrypt({
    value,
    workspaceId,
    primaryPattern,
    rowId,
    column,
  }: {
    value: string | null;
    workspaceId: string;
    primaryPattern: string;
    rowId: string;
    column: string;
  }):
    | { kind: 'rotated'; value: string }
    | { kind: 'skipped' }
    | { kind: 'error' } {
    if (value === null) {
      return { kind: 'skipped' };
    }

    if (!value.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)) {
      return { kind: 'skipped' };
    }

    if (value.startsWith(primaryPattern.slice(0, -1))) {
      return { kind: 'skipped' };
    }

    try {
      const plaintext = this.secretEncryptionService.decryptVersioned(value, {
        workspaceId,
      });
      const reEncrypted = this.secretEncryptionService.encryptVersioned(
        plaintext,
        { workspaceId },
      );

      return { kind: 'rotated', value: reEncrypted };
    } catch (error) {
      this.logger.warn(
        `[${this.siteName}] failed to re-encrypt ${column} of row ${rowId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return { kind: 'error' };
    }
  }
}
