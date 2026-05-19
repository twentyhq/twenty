import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationHandler,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import {
  countEncryptedColumnNonCurrentRows,
  rotateEncryptedColumn,
} from 'src/database/commands/secret-encryption-rotation/utils/rotate-encrypted-column.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const ENCRYPTED_COLUMNS = ['accessToken', 'refreshToken'] as const;

@Injectable()
export class ConnectedAccountTokensRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'connected-account-tokens';
  private readonly logger = new Logger(
    ConnectedAccountTokensRotationHandler.name,
  );

  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async countRemaining({
    primaryKeyId,
  }: {
    primaryKeyId: string;
  }): Promise<number> {
    return countEncryptedColumnNonCurrentRows({
      repository: this.connectedAccountRepository,
      primaryKeyId,
      encryptedColumns: [...ENCRYPTED_COLUMNS],
    });
  }

  async rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome> {
    const aggregated: SecretEncryptionRotationOutcome = {
      rotated: 0,
      skipped: 0,
      errors: 0,
    };

    for (const encryptedColumn of ENCRYPTED_COLUMNS) {
      const outcome = await rotateEncryptedColumn({
        ...context,
        repository: this.connectedAccountRepository,
        secretEncryptionService: this.secretEncryptionService,
        logger: this.logger,
        siteName: this.siteName,
        encryptedColumn,
        workspaceIdColumn: 'workspaceId',
      });

      aggregated.rotated += outcome.rotated;
      aggregated.skipped += outcome.skipped;
      aggregated.errors += outcome.errors;
    }

    return aggregated;
  }
}
