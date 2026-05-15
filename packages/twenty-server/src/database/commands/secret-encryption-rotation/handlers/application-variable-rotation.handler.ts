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

const ONLY_SECRET_ROWS = `"isSecret" = true`;

@Injectable()
export class ApplicationVariableRotationHandler
  implements SecretEncryptionRotationHandler
{
  readonly siteName = 'application-variable';
  private readonly logger = new Logger(ApplicationVariableRotationHandler.name);

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
      table: 'applicationVariable',
      columns: ['value'],
      primaryKeyId,
      extraWhereClause: ONLY_SECRET_ROWS,
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
      table: 'applicationVariable',
      column: 'value',
      workspaceIdColumn: 'workspaceId',
      primaryKeyId,
      batchSize,
      dryRun,
      extraWhereClause: ONLY_SECRET_ROWS,
    });
  }
}
