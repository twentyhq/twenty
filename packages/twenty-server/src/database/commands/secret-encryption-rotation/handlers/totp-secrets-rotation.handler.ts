import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SecretEncryptionColumnRotationService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-column-rotation.service';
import {
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationHandler,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';

const ENCRYPTED_COLUMN = 'secret';

@Injectable()
export class TotpSecretsRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'totp-secrets';

  constructor(
    @InjectRepository(TwoFactorAuthenticationMethodEntity)
    private readonly twoFactorAuthenticationMethodRepository: Repository<TwoFactorAuthenticationMethodEntity>,
    private readonly secretEncryptionColumnRotationService: SecretEncryptionColumnRotationService,
  ) {}

  async countRemaining({
    currentEncryptionKeyId,
  }: {
    currentEncryptionKeyId: string;
  }): Promise<number> {
    return this.secretEncryptionColumnRotationService.countNonCurrentRows({
      repository: this.twoFactorAuthenticationMethodRepository,
      currentEncryptionKeyId,
      encryptedColumns: [ENCRYPTED_COLUMN],
    });
  }

  async rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome> {
    return this.secretEncryptionColumnRotationService.rotateColumn({
      ...context,
      repository: this.twoFactorAuthenticationMethodRepository,
      siteName: this.siteName,
      encryptedColumn: ENCRYPTED_COLUMN,
      isWorkspaceScoped: true,
    });
  }
}
