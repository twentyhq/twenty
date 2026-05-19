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
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';

const ENCRYPTED_COLUMN = 'secret';

@Injectable()
export class TotpSecretsRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'totp-secrets';
  private readonly logger = new Logger(TotpSecretsRotationHandler.name);

  constructor(
    @InjectRepository(TwoFactorAuthenticationMethodEntity)
    private readonly twoFactorAuthenticationMethodRepository: Repository<TwoFactorAuthenticationMethodEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async countRemaining({
    primaryKeyId,
  }: {
    primaryKeyId: string;
  }): Promise<number> {
    return countEncryptedColumnNonCurrentRows({
      repository: this.twoFactorAuthenticationMethodRepository,
      primaryKeyId,
      encryptedColumns: [ENCRYPTED_COLUMN],
    });
  }

  async rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome> {
    return rotateEncryptedColumn({
      ...context,
      repository: this.twoFactorAuthenticationMethodRepository,
      secretEncryptionService: this.secretEncryptionService,
      logger: this.logger,
      siteName: this.siteName,
      encryptedColumn: ENCRYPTED_COLUMN,
      workspaceIdColumn: 'workspaceId',
    });
  }
}
