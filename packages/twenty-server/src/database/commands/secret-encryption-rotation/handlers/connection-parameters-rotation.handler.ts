import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ACCOUNT_TYPES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository, type SelectQueryBuilder } from 'typeorm';

import {
  SecretEncryptionRotationHandler,
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/interfaces/secret-encryption-rotation-handler.interface';
import { buildCurrentEncryptionKeyIdEnvelopeLikePattern } from 'src/database/commands/secret-encryption-rotation/utils/build-current-encryption-key-id-envelope-like-pattern.util';
import { buildRotationErrorMessage } from 'src/database/commands/secret-encryption-rotation/utils/build-rotation-error-message.util';
import {
  type EncryptedImapSmtpCaldavParams,
  type ImapSmtpCaldavParams,
} from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

@Injectable()
export class ConnectionParametersRotationHandler extends SecretEncryptionRotationHandler {
  private readonly logger = new Logger(
    ConnectionParametersRotationHandler.name,
  );

  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {
    super();
  }

  async countRemaining({
    currentEncryptionKeyId,
  }: Pick<
    SecretEncryptionRotationContext,
    'siteName' | 'currentEncryptionKeyId'
  >): Promise<number> {
    return this.buildRowToSelectQuery({ currentEncryptionKeyId }).getCount();
  }

  async rotate({
    siteName,
    currentEncryptionKeyId,
    batchSize,
    dryRun,
  }: SecretEncryptionRotationContext): Promise<SecretEncryptionRotationOutcome> {
    const outcome: SecretEncryptionRotationOutcome = {
      rotated: 0,
      skipped: 0,
      errors: 0,
    };
    let cursor = ZERO_UUID;

    while (true) {
      const rows = await this.buildRowToSelectQuery({ currentEncryptionKeyId })
        .andWhere('connected_account.id > :cursor', { cursor })
        .orderBy('connected_account.id', 'ASC')
        .take(batchSize)
        .getMany();

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        const originalConnectionParameters = row.connectionParameters;

        if (!isDefined(originalConnectionParameters)) {
          outcome.skipped += 1;
          continue;
        }

        let reEncryptedConnectionParameters: ImapSmtpCaldavParams;

        try {
          reEncryptedConnectionParameters =
            this.reEncryptConnectionParametersOrThrow({
              connectionParameters: originalConnectionParameters,
              workspaceId: row.workspaceId,
            });
        } catch (error) {
          this.logger.error(buildRotationErrorMessage(siteName, row.id, error));
          outcome.errors += 1;
          continue;
        }

        if (dryRun) {
          outcome.rotated += 1;
          continue;
        }

        const updateResult = await this.connectedAccountRepository
          .createQueryBuilder()
          .update()
          .set({ connectionParameters: reEncryptedConnectionParameters })
          .where('id = :rowId', { rowId: row.id })
          .andWhere(
            '"connectionParameters" IS NOT DISTINCT FROM CAST(:originalConnectionParametersJson AS jsonb)',
            {
              originalConnectionParametersJson: JSON.stringify(
                originalConnectionParameters,
              ),
            },
          )
          .execute();

        if ((updateResult.affected ?? 0) === 0) {
          outcome.skipped += 1;
          continue;
        }

        outcome.rotated += 1;
      }

      cursor = rows[rows.length - 1].id;
    }

    return outcome;
  }

  private reEncryptConnectionParametersOrThrow({
    connectionParameters,
    workspaceId,
  }: {
    connectionParameters: EncryptedImapSmtpCaldavParams;
    workspaceId: string;
  }): EncryptedImapSmtpCaldavParams {
    const result: EncryptedImapSmtpCaldavParams = {
      ...connectionParameters,
    };

    for (const protocol of ACCOUNT_TYPES) {
      const params = connectionParameters[protocol];

      if (!isDefined(params)) {
        continue;
      }

      const plaintext = this.secretEncryptionService.decryptVersionedOrThrow(
        params.password,
        { workspaceId },
      );

      result[protocol] = {
        ...params,
        password: this.secretEncryptionService.encryptVersioned(plaintext, {
          workspaceId,
        }),
      };
    }

    return result;
  }

  private buildRowToSelectQuery({
    currentEncryptionKeyId,
  }: {
    currentEncryptionKeyId: string;
  }): SelectQueryBuilder<ConnectedAccountEntity> {
    const currentEnvelopePattern =
      buildCurrentEncryptionKeyIdEnvelopeLikePattern(currentEncryptionKeyId);

    return this.connectedAccountRepository
      .createQueryBuilder('connected_account')
      .where('connected_account."connectionParameters" IS NOT NULL')
      .andWhere(
        `(
          (connected_account."connectionParameters"->'IMAP'->>'password' IS NOT NULL
            AND connected_account."connectionParameters"->'IMAP'->>'password' NOT LIKE :currentEnvelopePattern)
          OR (connected_account."connectionParameters"->'SMTP'->>'password' IS NOT NULL
            AND connected_account."connectionParameters"->'SMTP'->>'password' NOT LIKE :currentEnvelopePattern)
          OR (connected_account."connectionParameters"->'CALDAV'->>'password' IS NOT NULL
            AND connected_account."connectionParameters"->'CALDAV'->>'password' NOT LIKE :currentEnvelopePattern)
        )`,
        { currentEnvelopePattern },
      );
  }
}
