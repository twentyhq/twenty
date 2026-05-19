import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SecretEncryptionColumnRotationService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-column-rotation.service';
import {
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationHandler,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';

const ENCRYPTED_COLUMN = 'value';
const ONLY_SECRET_ROWS_WHERE = `"isSecret" = true`;

@Injectable()
export class ApplicationVariableRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'application-variable';

  constructor(
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
    private readonly secretEncryptionColumnRotationService: SecretEncryptionColumnRotationService,
  ) {}

  async countRemaining({
    currentEncryptionKeyId,
  }: {
    currentEncryptionKeyId: string;
  }): Promise<number> {
    return this.secretEncryptionColumnRotationService.countNonCurrentRows({
      repository: this.applicationVariableRepository,
      currentEncryptionKeyId,
      encryptedColumns: [ENCRYPTED_COLUMN],
      extraWhereSql: ONLY_SECRET_ROWS_WHERE,
    });
  }

  async rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome> {
    return this.secretEncryptionColumnRotationService.rotateColumn({
      ...context,
      repository: this.applicationVariableRepository,
      siteName: this.siteName,
      encryptedColumn: ENCRYPTED_COLUMN,
      workspaceIdColumn: 'workspaceId',
      extraWhereSql: ONLY_SECRET_ROWS_WHERE,
    });
  }
}
