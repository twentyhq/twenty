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
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const ENCRYPTED_COLUMN = 'encryptedValue';

@Injectable()
export class ApplicationRegistrationVariableRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'application-registration-variable';
  private readonly logger = new Logger(
    ApplicationRegistrationVariableRotationHandler.name,
  );

  constructor(
    @InjectRepository(ApplicationRegistrationVariableEntity)
    private readonly applicationRegistrationVariableRepository: Repository<ApplicationRegistrationVariableEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async countRemaining({
    primaryKeyId,
  }: {
    primaryKeyId: string;
  }): Promise<number> {
    return countEncryptedColumnNonCurrentRows({
      repository: this.applicationRegistrationVariableRepository,
      primaryKeyId,
      encryptedColumns: [ENCRYPTED_COLUMN],
    });
  }

  async rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome> {
    return rotateEncryptedColumn({
      ...context,
      repository: this.applicationRegistrationVariableRepository,
      secretEncryptionService: this.secretEncryptionService,
      logger: this.logger,
      siteName: this.siteName,
      encryptedColumn: ENCRYPTED_COLUMN,
    });
  }
}
