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

type TotpRow = {
  id: string;
  workspaceId: string;
  secret: string;
};

@Injectable()
export class TotpSecretsRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'totp-secrets';
  private readonly logger = new Logger(TotpSecretsRotationHandler.name);

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
      table: 'twoFactorAuthenticationMethod',
      columns: ['secret'],
      primaryKeyId,
    });
  }

  // TOTP rows are workspace-scoped (HKDF info uses the workspaceId), so the
  // helper that infers workspaceId from a column on the same table cannot be
  // reused — `twoFactorAuthenticationMethod` carries `workspaceId` directly,
  // which works, but the SELECT keeps an explicit alias for clarity.
  async run({
    primaryKeyId,
    batchSize,
    dryRun,
  }: SecretEncryptionRotationHandlerOptions) {
    const primaryPattern = buildPrimaryKeyIdEnvelopeLikePattern(primaryKeyId);

    let rotated = 0;
    let skipped = 0;
    let errors = 0;
    let cursor = '00000000-0000-0000-0000-000000000000';

    while (true) {
      const rows: TotpRow[] = await this.dataSource.query(
        `SELECT id, "workspaceId", "secret"
           FROM "core"."twoFactorAuthenticationMethod"
          WHERE id > $1
            AND "secret" LIKE $2
            AND "secret" NOT LIKE $3
          ORDER BY id
          LIMIT $4`,
        [cursor, ANY_V2_ENVELOPE_LIKE_PATTERN, primaryPattern, batchSize],
      );

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        if (!row.secret.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)) {
          skipped++;
          continue;
        }

        try {
          const plaintext = this.secretEncryptionService.decryptVersioned(
            row.secret,
            { workspaceId: row.workspaceId },
          );
          const reEncrypted = this.secretEncryptionService.encryptVersioned(
            plaintext,
            { workspaceId: row.workspaceId },
          );

          if (!dryRun) {
            await this.dataSource.query(
              `UPDATE "core"."twoFactorAuthenticationMethod"
                  SET "secret" = $2
                WHERE id = $1`,
              [row.id, reEncrypted],
            );
          }

          rotated++;
        } catch (error) {
          errors++;
          this.logger.warn(
            `[${this.siteName}] failed to re-encrypt row ${row.id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      cursor = rows[rows.length - 1].id;
    }

    return { rotated, skipped, errors };
  }
}
