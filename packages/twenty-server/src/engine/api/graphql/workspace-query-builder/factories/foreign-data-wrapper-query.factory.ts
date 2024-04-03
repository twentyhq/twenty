import { Injectable } from '@nestjs/common';

import {
  ForeignDataWrapperOptions,
  RemoteServerType,
  UserMappingOptions,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';

@Injectable()
export class ForeignDataWrapperQueryFactory {
  createForeignDataWrapper(
    foreignDataWrapperId: string,
    foreignDataWrapperType: RemoteServerType,
    foreignDataWrapperOptions: ForeignDataWrapperOptions<RemoteServerType>,
  ) {
    const [name, options] = this.buildNameAndOptionsFromType(
      foreignDataWrapperType,
      foreignDataWrapperOptions,
    );

    return `CREATE SERVER "${foreignDataWrapperId}" FOREIGN DATA WRAPPER ${name} OPTIONS (${options})`;
  }

  createUserMapping(
    foreignDataWrapperId: string,
    userMappingOptions: UserMappingOptions,
  ) {
    // CURRENT_USER works for now since we are using only one user. But if we switch to a user per workspace, we need to change this.
    return `CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER SERVER "${foreignDataWrapperId}" OPTIONS (user '${userMappingOptions.username}', password '${userMappingOptions.password}')`;
  }

  private buildNameAndOptionsFromType(
    type: RemoteServerType,
    options: ForeignDataWrapperOptions<RemoteServerType>,
  ) {
    switch (type) {
      case RemoteServerType.POSTGRES_FDW:
        return ['postgres_fdw', this.buildPostgresFDWQueryOptions(options)];
      default:
        throw new Error('Foreign data wrapper type not supported');
    }
  }

  private buildPostgresFDWQueryOptions(
    foreignDataWrapperOptions: ForeignDataWrapperOptions<RemoteServerType>,
  ) {
    return `dbname '${foreignDataWrapperOptions.dbname}', host '${foreignDataWrapperOptions.host}', port '${foreignDataWrapperOptions.port}'`;
  }
}
