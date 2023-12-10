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
    const { workspaceId, type, accessToken, refreshToken } =
      saveConnectedAccountInput;

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource = await this.typeORMService.connectToDataSource(
      dataSourceMetadata,
    );

    await workspaceDataSource?.query(
      `INSERT INTO ${dataSourceMetadata.schema}."connectedAccount" ("type", "accessToken", "refreshToken") VALUES ('${type}', '${accessToken}', '${refreshToken}')`,
    );

    return;
  }
}
