import { Injectable } from '@nestjs/common';

import {
  type ForeignDataWrapperOptions,
  type RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { type UserMappingOptions } from 'src/engine/metadata-modules/remote-server/types/user-mapping-options';

@Injectable()
export class ForeignDataWrapperServerQueryFactory {
  createForeignDataWrapperServer(
    foreignDataWrapperId: string,
    foreignDataWrapperType: RemoteServerType,
    foreignDataWrapperOptions: ForeignDataWrapperOptions<RemoteServerType>,
  ) {
    const options = this.buildQueryOptions(foreignDataWrapperOptions, false);

    return `CREATE SERVER "${foreignDataWrapperId}" FOREIGN DATA WRAPPER ${foreignDataWrapperType} OPTIONS (${options})`;
  }

  updateForeignDataWrapperServer({
    foreignDataWrapperId,
    foreignDataWrapperOptions,
  }: {
    foreignDataWrapperId: string;
    foreignDataWrapperOptions: Partial<
      ForeignDataWrapperOptions<RemoteServerType>
    >;
  }) {
    const options = this.buildQueryOptions(foreignDataWrapperOptions, true);

    return `ALTER SERVER "${foreignDataWrapperId}" OPTIONS (${options})`;
  }

  createUserMapping(
    foreignDataWrapperId: string,
    userMappingOptions: UserMappingOptions,
  ) {
    const options = this.buildQueryOptions(userMappingOptions, false);

    // CURRENT_USER works for now since we are using only one user. But if we switch to a user per workspace, we need to change this.
    return `CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER SERVER "${foreignDataWrapperId}" OPTIONS (${options})`;
  }

  updateUserMapping(
    foreignDataWrapperId: string,
    userMappingOptions: Partial<UserMappingOptions>,
  ) {
    const options = this.buildQueryOptions(userMappingOptions, true);

    // CURRENT_USER works for now since we are using only one user. But if we switch to a user per workspace, we need to change this.
    return `ALTER USER MAPPING FOR CURRENT_USER SERVER "${foreignDataWrapperId}" OPTIONS (${options})`;
  }

  private buildQueryOptions(
    options:
      | ForeignDataWrapperOptions<RemoteServerType>
      | Partial<ForeignDataWrapperOptions<RemoteServerType>>
      | UserMappingOptions
      | Partial<UserMappingOptions>,
    isUpdate: boolean,
  ) {
    const prefix = isUpdate ? 'SET ' : '';

    return Object.entries(options)
      .map(([key, value]) => `${prefix}${key} '${value}'`)
      .join(', ');
  }
}
