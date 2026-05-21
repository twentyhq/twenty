import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ACCOUNT_TYPES, type AccountType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository, type SelectQueryBuilder } from 'typeorm';

import { SECRET_ENCRYPTION_ROTATION_SITE_NAME } from 'src/database/commands/secret-encryption-rotation/constants/secret-encryption-rotation-site-name.constant';
import {
  SecretEncryptionRotationHandler,
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/interfaces/secret-encryption-rotation-handler.interface';
import { buildCurrentEncryptionKeyIdEnvelopeLikePattern } from 'src/database/commands/secret-encryption-rotation/utils/build-current-encryption-key-id-envelope-like-pattern.util';
import { buildRotationErrorMessage } from 'src/database/commands/secret-encryption-rotation/utils/build-rotation-error-message.util';
import {
  type ConnectionParameters,
  type ImapSmtpCaldavParams,
} from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

// connectedAccount.connectionParameters is a JSONB column shaped as
// { IMAP?: { password: enc:v2:…, … }, SMTP?: …, CALDAV?: … }. Each protocol's
// password is encrypted independently with the workspace id threaded into HKDF,
// matching how `EncryptConnectionParametersSlowInstanceCommand` backfilled it.
// The generic ColumnRotationSiteHandler cannot be reused because the envelope
// lives at `connectionParameters->'<PROTOCOL>'->>'password'`, not the whole
// column, and up to three independent envelopes may need rotating per row.
@Injectable()
export class ConnectionParametersRotationHandler extends SecretEncryptionRotationHandler {
  readonly siteName =
    SECRET_ENCRYPTION_ROTATION_SITE_NAME.CONNECTED_ACCOUNT_CONNECTION_PARAMETERS;
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
  }: {
    currentEncryptionKeyId: string;
  }): Promise<number> {
    return this.buildRotationQuery({ currentEncryptionKeyId }).getCount();
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
    let cursor = ZERO_UUID;

    while (true) {
      const rows = await this.buildRotationQuery({ currentEncryptionKeyId })
        .andWhere('connectedAccount.id > :cursor', { cursor })
        .orderBy('connectedAccount.id', 'ASC')
        .take(batchSize)
        .getMany();

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        const rowOutcome = await this.rotateRow({
          row,
          currentEncryptionKeyId,
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
    currentEncryptionKeyId,
    dryRun,
  }: {
    row: ConnectedAccountEntity;
    currentEncryptionKeyId: string;
    dryRun: boolean;
  }): Promise<SecretEncryptionRotationOutcome> {
    const rowId = row.id;
    const originalParams = row.connectionParameters;

    if (!isDefined(originalParams)) {
      // The WHERE clause already excludes NULL rows, but guard defensively in
      // case TypeORM hydration ever surprises us.
      return { rotated: 0, skipped: 1, errors: 0 };
    }

    const nextParams: ImapSmtpCaldavParams = { ...originalParams };
    let rotatedAtLeastOneProtocol = false;

    try {
      for (const protocol of ACCOUNT_TYPES) {
        const protocolParams = originalParams[protocol];

        if (!isDefined(protocolParams)) {
          continue;
        }

        const rotatedProtocolParams = this.rotateProtocolPassword({
          row,
          protocol,
          protocolParams,
          currentEncryptionKeyId,
        });

        if (rotatedProtocolParams === protocolParams) {
          continue;
        }

        nextParams[protocol] = rotatedProtocolParams;
        rotatedAtLeastOneProtocol = true;
      }
    } catch (error) {
      this.logger.error(buildRotationErrorMessage(this.siteName, rowId, error));

      return { rotated: 0, skipped: 0, errors: 1 };
    }

    if (!rotatedAtLeastOneProtocol) {
      return { rotated: 0, skipped: 1, errors: 0 };
    }

    if (dryRun) {
      return { rotated: 1, skipped: 0, errors: 0 };
    }

    // jsonb-level equality (not ::text) so the guard is independent of
    // Postgres's internal jsonb key ordering vs. JSON.stringify's ordering.
    const originalParamsJson = JSON.stringify(originalParams);
    const updateResult = await this.connectedAccountRepository
      .createQueryBuilder()
      .update()
      .set({ connectionParameters: nextParams })
      .where('id = :rowId', { rowId })
      .andWhere(
        '"connectionParameters" IS NOT DISTINCT FROM CAST(:originalParamsJson AS jsonb)',
        { originalParamsJson },
      )
      .execute();

    if ((updateResult.affected ?? 0) === 0) {
      this.logger.warn(
        `[${this.siteName}] row ${rowId}: connectionParameters changed during rotation, skipping. It will be picked up by a subsequent run.`,
      );

      return { rotated: 0, skipped: 1, errors: 0 };
    }

    return { rotated: 1, skipped: 0, errors: 0 };
  }

  // Returns the input reference unchanged when the password is already on the
  // current key id, so the caller can cheaply detect a no-op via identity
  // equality. Throws (which the caller maps to `errors++`) when the password is
  // missing the versioned envelope prefix — operators must run the slow
  // instance command first to backfill plaintext passwords.
  private rotateProtocolPassword({
    row,
    protocol,
    protocolParams,
    currentEncryptionKeyId,
  }: {
    row: ConnectedAccountEntity;
    protocol: AccountType;
    protocolParams: ConnectionParameters;
    currentEncryptionKeyId: string;
  }): ConnectionParameters {
    const { password } = protocolParams;

    if (!password.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)) {
      throw new Error(
        `${protocol} password is not a versioned envelope (expected '${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}…'), refusing to rotate.`,
      );
    }

    const currentEnvelopePrefix = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${currentEncryptionKeyId}:`;

    if (password.startsWith(currentEnvelopePrefix)) {
      return protocolParams;
    }

    const cryptoOptions = { workspaceId: row.workspaceId };
    const plaintext = this.secretEncryptionService.decryptVersioned(
      password,
      cryptoOptions,
    );
    const reEncrypted = this.secretEncryptionService.encryptVersioned(
      plaintext,
      cryptoOptions,
    );

    return { ...protocolParams, password: reEncrypted };
  }

  private buildRotationQuery({
    currentEncryptionKeyId,
  }: {
    currentEncryptionKeyId: string;
  }): SelectQueryBuilder<ConnectedAccountEntity> {
    const currentEnvelopePattern =
      buildCurrentEncryptionKeyIdEnvelopeLikePattern(currentEncryptionKeyId);

    // Row needs rotation when ANY non-null protocol password is not yet on the
    // current key id. The CHK constraint guarantees non-null passwords match
    // `enc:v2:%`, so we only have to compare against the current-kid prefix.
    return this.connectedAccountRepository
      .createQueryBuilder('connectedAccount')
      .where('connectedAccount."connectionParameters" IS NOT NULL')
      .andWhere(
        `(
          (connectedAccount."connectionParameters"->'IMAP'->>'password' IS NOT NULL
            AND connectedAccount."connectionParameters"->'IMAP'->>'password' NOT LIKE :currentEnvelopePattern)
          OR (connectedAccount."connectionParameters"->'SMTP'->>'password' IS NOT NULL
            AND connectedAccount."connectionParameters"->'SMTP'->>'password' NOT LIKE :currentEnvelopePattern)
          OR (connectedAccount."connectionParameters"->'CALDAV'->>'password' IS NOT NULL
            AND connectedAccount."connectionParameters"->'CALDAV'->>'password' NOT LIKE :currentEnvelopePattern)
        )`,
        { currentEnvelopePattern },
      );
  }
}
