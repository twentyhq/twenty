import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import {
  type SecretEncryptionRotationHandler,
  type SecretEncryptionRotationHandlerOptions,
} from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import { countNonCurrentKeyIdRows } from 'src/database/commands/secret-encryption-rotation/utils/count-non-current-keyid-rows.util';
import { rotateSingleVarcharColumn } from 'src/database/commands/secret-encryption-rotation/utils/rotate-single-column.util';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

@Injectable()
export class ApplicationRegistrationVariableRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'application-registration-variable';
  private readonly logger = new Logger(
    ApplicationRegistrationVariableRotationHandler.name,
  );

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async countRemaining({
    primaryKeyId,
  }: {
    primaryKeyId: string;
  }): Promise<number> {
    return countNonCurrentKeyIdRows({
      dataSource: this.dataSource,
      schema: 'core',
      table: 'applicationRegistrationVariable',
      columns: ['encryptedValue'],
      primaryKeyId,
    });
  }

  async run({
    primaryKeyId,
    batchSize,
    dryRun,
  }: SecretEncryptionRotationHandlerOptions) {
    return rotateSingleVarcharColumn({
      dataSource: this.dataSource,
      secretEncryptionService: this.secretEncryptionService,
      logger: this.logger,
      siteName: this.siteName,
      schema: 'core',
      table: 'applicationRegistrationVariable',
      column: 'encryptedValue',
      primaryKeyId,
      batchSize,
      dryRun,
    });
  }
}
