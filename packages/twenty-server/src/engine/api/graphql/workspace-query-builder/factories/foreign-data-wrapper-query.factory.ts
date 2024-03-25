import { Injectable } from '@nestjs/common';

import {
  FdwOptions,
  RemoteServerType,
  UserMappingOptions,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';

@Injectable()
export class ForeignDataWrapperQueryFactory {
  createFDW(
    fdwId: string,
    fdwType: RemoteServerType,
    fdwOptions: FdwOptions<RemoteServerType>,
  ) {
    let fdwName = '';
    let options = '';

    switch (fdwType) {
      case RemoteServerType.POSTGRES_FDW:
        fdwName = 'postgres_fdw';
        options = this.buildPostgresFDWQueryOptions(fdwOptions);
        break;
      default:
        throw new Error('FDW type not supported');
    }

    return `CREATE SERVER IF NOT EXISTS "${fdwId}" FOREIGN DATA WRAPPER ${fdwName} OPTIONS (${options})`;
  }

  createUserMapping(fdwId: string, userMappingOptions: UserMappingOptions) {
    return `CREATE USER MAPPING IF NOT EXISTS FOR ${userMappingOptions.username} SERVER "${fdwId}" OPTIONS (user '${userMappingOptions.username}', password '${userMappingOptions.password}')`;
  }

  private buildPostgresFDWQueryOptions(
    fdwOptions: FdwOptions<RemoteServerType>,
  ) {
    return `dbname '${fdwOptions.dbname}', host '${fdwOptions.host}', port '${fdwOptions.port}'`;
  }
}
