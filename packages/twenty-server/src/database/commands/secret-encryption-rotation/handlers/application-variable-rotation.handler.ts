import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type FindOptionsWhere, Repository } from 'typeorm';

import {
  SecretEncryptionRotationHandler,
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/interfaces/secret-encryption-rotation-handler.interface';
import { SecretEncryptionColumnRotationService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-column-rotation.service';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';

const ENCRYPTED_COLUMN = 'value';
const ONLY_SECRET_ROWS_WHERE: FindOptionsWhere<ApplicationVariableEntity> = {
  isSecret: true,
};

@Injectable()
export class ApplicationVariableRotationHandler extends SecretEncryptionRotationHandler {
  readonly siteName = 'application-variable';

  constructor(
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
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
      repository: this.applicationVariableRepository,
      currentEncryptionKeyId,
      encryptedColumns: [ENCRYPTED_COLUMN],
      extraWhere: ONLY_SECRET_ROWS_WHERE,
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
      isWorkspaceScoped: true,
      extraWhere: ONLY_SECRET_ROWS_WHERE,
    });
  }
}
