import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SecretEncryptionColumnRotationService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-column-rotation.service';
import {
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationHandler,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import { SigningKeyEntity } from 'src/engine/core-modules/jwt/entities/signing-key.entity';

const ENCRYPTED_COLUMN = 'privateKey';

@Injectable()
export class SigningKeyPrivateKeysRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'signing-key-private-keys';

  constructor(
    @InjectRepository(SigningKeyEntity)
    private readonly signingKeyRepository: Repository<SigningKeyEntity>,
    private readonly secretEncryptionColumnRotationService: SecretEncryptionColumnRotationService,
  ) {}

  async countRemaining({
    currentEncryptionKeyId,
  }: {
    currentEncryptionKeyId: string;
  }): Promise<number> {
    return this.secretEncryptionColumnRotationService.countNonCurrentRows({
      repository: this.signingKeyRepository,
      currentEncryptionKeyId,
      encryptedColumns: [ENCRYPTED_COLUMN],
    });
  }

  async rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome> {
    return this.secretEncryptionColumnRotationService.rotateColumn({
      ...context,
      repository: this.signingKeyRepository,
      siteName: this.siteName,
      encryptedColumn: ENCRYPTED_COLUMN,
    });
  }
}
