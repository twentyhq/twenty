import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SecretEncryptionColumnRotationService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-column-rotation.service';
import {
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationHandler,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';

const ENCRYPTED_COLUMN = 'encryptedValue';

@Injectable()
export class ApplicationRegistrationVariableRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'application-registration-variable';

  constructor(
    @InjectRepository(ApplicationRegistrationVariableEntity)
    private readonly applicationRegistrationVariableRepository: Repository<ApplicationRegistrationVariableEntity>,
    private readonly secretEncryptionColumnRotationService: SecretEncryptionColumnRotationService,
  ) {}

  async countRemaining({
    currentEncryptionKeyId,
  }: {
    currentEncryptionKeyId: string;
  }): Promise<number> {
    return this.secretEncryptionColumnRotationService.countNonCurrentRows({
      repository: this.applicationRegistrationVariableRepository,
      currentEncryptionKeyId,
      encryptedColumns: [ENCRYPTED_COLUMN],
    });
  }

  async rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome> {
    return this.secretEncryptionColumnRotationService.rotateColumn({
      ...context,
      repository: this.applicationRegistrationVariableRepository,
      siteName: this.siteName,
      encryptedColumn: ENCRYPTED_COLUMN,
    });
  }
}
