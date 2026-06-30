import { isDefined } from 'twenty-shared/utils';
import { DataSource, QueryRunner } from 'typeorm';

import {
  type EncryptedImapSmtpCaldavParams,
  type ImapSmtpCaldavParams,
  type PlaintextImapSmtpCaldavParams,
} from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { ACCOUNT_TYPES } from 'twenty-shared/constants';

const BACKFILL_BATCH_SIZE = 500;

const CHECK_CONSTRAINT_NAME =
  'CHK_connectedAccount_connectionParameters_encrypted';

type ConnectionParametersRow = {
  id: string;
  workspaceId: string;
  // Pre-backfill rows can hold either plaintext or already-v2 passwords.
  // Either form is structurally a `string` at the JSONB layer; the brand
  // type is a phantom marker only.
  connectionParameters: ImapSmtpCaldavParams | null;
};

const hasPlaintextPassword = (params: ImapSmtpCaldavParams): boolean => {
  for (const protocol of ACCOUNT_TYPES) {
    const protocolParams = params[protocol];

    if (
      isDefined(protocolParams?.password) &&
      !protocolParams.password.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)
    ) {
      return true;
    }
  }

  return false;
};

@RegisteredInstanceCommand('2.7.0', 1798000010000, { type: 'slow' })
export class EncryptConnectionParametersSlowInstanceCommand implements SlowInstanceCommand {
  constructor(
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
  ) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    let cursor = '00000000-0000-0000-0000-000000000000';

    while (true) {
      const rows: ConnectionParametersRow[] = await dataSource.query(
        `SELECT id, "workspaceId", "connectionParameters"
           FROM "core"."connectedAccount"
          WHERE id > $1
            AND "connectionParameters" IS NOT NULL
          ORDER BY id
          LIMIT $2`,
        [cursor, BACKFILL_BATCH_SIZE],
      );

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        if (!isDefined(row.connectionParameters)) {
          continue;
        }

        if (!hasPlaintextPassword(row.connectionParameters)) {
          continue;
        }

        const plaintextOnly: PlaintextImapSmtpCaldavParams = {};

        for (const protocol of ACCOUNT_TYPES) {
          const protocolParams = row.connectionParameters[protocol];

          if (
            isDefined(protocolParams?.password) &&
            !protocolParams.password.startsWith(
              SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX,
            )
          ) {
            // Upstream filter guarantees this protocol's password is
            // plaintext (no `enc:v2:` prefix); brand the leaf in-place so
            // the encryption service can consume it.
            plaintextOnly[protocol] = {
              ...protocolParams,
              password: protocolParams.password as PlaintextString,
            };
          }
        }

        const encrypted =
          this.connectedAccountTokenEncryptionService.encryptConnectionParameters(
            {
              connectionParameters: plaintextOnly,
              workspaceId: row.workspaceId,
            },
          );

        // Pre-backfill row may already contain a mix of plaintext and
        // already-encrypted protocols; we trust the entity-level brand on
        // the post-merge result since each protocol is either freshly
        // encrypted above or was already an `enc:v2:` envelope.
        const merged: EncryptedImapSmtpCaldavParams = {
          ...(row.connectionParameters as EncryptedImapSmtpCaldavParams),
          ...encrypted,
        };

        await dataSource.query(
          `UPDATE "core"."connectedAccount"
              SET "connectionParameters" = $2
            WHERE id = $1`,
          [row.id, JSON.stringify(merged)],
        );
      }

      cursor = rows[rows.length - 1].id;
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       ADD CONSTRAINT "${CHECK_CONSTRAINT_NAME}"
       CHECK (
         "connectionParameters" IS NULL
         OR (
           (("connectionParameters"->'IMAP'->>'password') IS NULL OR ("connectionParameters"->'IMAP'->>'password') LIKE 'enc:v2:%')
           AND (("connectionParameters"->'SMTP'->>'password') IS NULL OR ("connectionParameters"->'SMTP'->>'password') LIKE 'enc:v2:%')
           AND (("connectionParameters"->'CALDAV'->>'password') IS NULL OR ("connectionParameters"->'CALDAV'->>'password') LIKE 'enc:v2:%')
         )
       )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       DROP CONSTRAINT IF EXISTS "${CHECK_CONSTRAINT_NAME}"`,
    );
  }
}
