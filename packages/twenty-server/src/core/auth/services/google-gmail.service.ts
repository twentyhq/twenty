import { Injectable } from '@nestjs/common';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { SaveConnectedAccountInput } from 'src/core/auth/dto/save-connected-account';

@Injectable()
export class GoogleGmailService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
  ) {}

  async saveConnectedAccount(
    saveConnectedAccountInput: SaveConnectedAccountInput,
  ) {
    const {
      email,
      workspaceId,
      type,
      accessToken,
      refreshToken,
      workspaceMemberId,
    } = saveConnectedAccountInput;

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource = await this.typeORMService.connectToDataSource(
      dataSourceMetadata,
    );

    const connectedAccount = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."connectedAccount" WHERE "email" = '${email}' AND "type" = '${type}'`,
    );

    if (connectedAccount.length > 0) {
      // throw new ConflictException(
      //   'This account is already connected to your workspace.',
      // );
      console.log('This account is already connected to your workspace.');
    } else {
      await workspaceDataSource?.query(
        `INSERT INTO ${dataSourceMetadata.schema}."connectedAccount" ("email", "type", "accessToken", "refreshToken", "accountOwnerId") VALUES ('${email}', '${type}', '${accessToken}', '${refreshToken}', '${workspaceMemberId}')`,
      );
    }

    return;
  }
}
