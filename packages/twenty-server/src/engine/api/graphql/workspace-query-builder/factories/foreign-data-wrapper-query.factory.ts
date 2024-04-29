import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';

import {
  ForeignDataWrapperOptions,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { UserMappingOptionsInput } from 'src/engine/metadata-modules/remote-server/utils/user-mapping-options.utils';

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

  updateForeignDataWrapper({
    foreignDataWrapperId,
    foreignDataWrapperOptions,
  }: {
    foreignDataWrapperId: string;
    foreignDataWrapperOptions: Partial<
      ForeignDataWrapperOptions<RemoteServerType>
    >;
  }) {
    const options = this.buildUpdateOptions(foreignDataWrapperOptions);

    return `ALTER SERVER "${foreignDataWrapperId}" OPTIONS (${options})`;
  }

  createUserMapping(
    foreignDataWrapperId: string,
    userMappingOptions: UserMappingOptionsInput,
  ) {
    // CURRENT_USER works for now since we are using only one user. But if we switch to a user per workspace, we need to change this.
    return `CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER SERVER "${foreignDataWrapperId}" OPTIONS (user '${userMappingOptions.username}', password '${userMappingOptions.password}')`;
  }

  updateUserMapping(
    foreignDataWrapperId: string,
    userMappingOptions: Partial<UserMappingOptionsInput>,
  ) {
    const options = this.buildUpdateUserMappingOptions(userMappingOptions);

    // CURRENT_USER works for now since we are using only one user. But if we switch to a user per workspace, we need to change this.
    return `ALTER USER MAPPING FOR CURRENT_USER SERVER "${foreignDataWrapperId}" OPTIONS (${options})`;
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

  private buildUpdateOptions(
    options: Partial<ForeignDataWrapperOptions<RemoteServerType>>,
  ) {
    const rawQuerySetStatements: string[] = [];

    Object.entries(options).forEach(([key, value]) => {
      if (isDefined(value)) {
        rawQuerySetStatements.push(`SET ${key} '${value}'`);
      }
    });

    return rawQuerySetStatements.join(', ');
  }

  private buildUpdateUserMappingOptions(
    userMappingOptions?: Partial<UserMappingOptionsInput>,
  ) {
    const setStatements: string[] = [];

    if (isDefined(userMappingOptions?.username)) {
      setStatements.push(`SET user '${userMappingOptions?.username}'`);
    }

    if (isDefined(userMappingOptions?.password)) {
      setStatements.push(`SET password '${userMappingOptions?.password}'`);
    }

    return setStatements.join(', ');
  }

  private buildPostgresFDWQueryOptions(
    foreignDataWrapperOptions: ForeignDataWrapperOptions<RemoteServerType>,
  ) {
    return `dbname '${foreignDataWrapperOptions.dbname}', host '${foreignDataWrapperOptions.host}', port '${foreignDataWrapperOptions.port}'`;
  }
}
