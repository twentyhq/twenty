import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  SecretEncryptionRotationHandler,
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/interfaces/secret-encryption-rotation-handler.interface';
import { SecretEncryptionColumnRotationService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-column-rotation.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

const ENCRYPTED_COLUMNS = ['accessToken', 'refreshToken'] as const;

@Injectable()
export class ConnectedAccountTokensRotationHandler extends SecretEncryptionRotationHandler {
  readonly siteName = 'connected-account-tokens';

  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly secretEncryptionColumnRotationService: SecretEncryptionColumnRotationService,
  ) {
    super();
  }

  async countRemaining({
    currentEncryptionKeyId,
  }: {
    currentEncryptionKeyId: string;
  }): Promise<number> {
    return this.secretEncryptionColumnRotationService.countNonCurrentRows({
      repository: this.connectedAccountRepository,
      currentEncryptionKeyId,
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
      const outcome =
        await this.secretEncryptionColumnRotationService.rotateColumn({
          ...context,
          repository: this.connectedAccountRepository,
          siteName: this.siteName,
          encryptedColumn,
          isWorkspaceScoped: true,
        });

      aggregated.rotated += outcome.rotated;
      aggregated.skipped += outcome.skipped;
      aggregated.errors += outcome.errors;
    }

    return aggregated;
  }
}
