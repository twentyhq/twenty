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
import { SigningKeyEntity } from 'src/engine/core-modules/jwt/entities/signing-key.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const ENCRYPTED_COLUMN = 'privateKey';

@Injectable()
export class SigningKeyPrivateKeysRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'signing-key-private-keys';
  private readonly logger = new Logger(
    SigningKeyPrivateKeysRotationHandler.name,
  );

  constructor(
    @InjectRepository(SigningKeyEntity)
    private readonly signingKeyRepository: Repository<SigningKeyEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async countRemaining({
    primaryKeyId,
  }: {
    primaryKeyId: string;
  }): Promise<number> {
    return countEncryptedColumnNonCurrentRows({
      repository: this.signingKeyRepository,
      primaryKeyId,
      encryptedColumns: [ENCRYPTED_COLUMN],
    });
  }

  async rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome> {
    return rotateEncryptedColumn({
      ...context,
      repository: this.signingKeyRepository,
      secretEncryptionService: this.secretEncryptionService,
      logger: this.logger,
      siteName: this.siteName,
      encryptedColumn: ENCRYPTED_COLUMN,
    });
  }
}
