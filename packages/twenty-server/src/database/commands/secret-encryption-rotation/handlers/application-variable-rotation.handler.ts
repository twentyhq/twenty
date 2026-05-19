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
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const ENCRYPTED_COLUMN = 'value';
const ONLY_SECRET_ROWS_WHERE = `"isSecret" = true`;

@Injectable()
export class ApplicationVariableRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'application-variable';
  private readonly logger = new Logger(ApplicationVariableRotationHandler.name);

  constructor(
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async countRemaining({
    primaryKeyId,
  }: {
    primaryKeyId: string;
  }): Promise<number> {
    return countEncryptedColumnNonCurrentRows({
      repository: this.applicationVariableRepository,
      primaryKeyId,
      encryptedColumns: [ENCRYPTED_COLUMN],
      extraWhereSql: ONLY_SECRET_ROWS_WHERE,
    });
  }

  async rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome> {
    return rotateEncryptedColumn({
      ...context,
      repository: this.applicationVariableRepository,
      secretEncryptionService: this.secretEncryptionService,
      logger: this.logger,
      siteName: this.siteName,
      encryptedColumn: ENCRYPTED_COLUMN,
      workspaceIdColumn: 'workspaceId',
      extraWhereSql: ONLY_SECRET_ROWS_WHERE,
    });
  }
}
