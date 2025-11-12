import { Injectable } from '@nestjs/common';

import { type QueryRunner } from 'typeorm';

import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { mergeUserVars } from 'src/engine/core-modules/user/user-vars/utils/merge-user-vars.util';

@Injectable()
export class UserVarsService<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  KeyValueTypesMap extends Record<string, any> = Record<string, any>,
> {
  constructor(private readonly keyValuePairService: KeyValuePairService) {}

  public async get<K extends keyof KeyValueTypesMap>({
    userId,
    workspaceId,
    key,
  }: {
    userId?: string;
    workspaceId?: string;
    key: Extract<K, string>;
  }): Promise<KeyValueTypesMap[K]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userVarWorkspaceLevel: any[] = [];

    if (workspaceId) {
      userVarWorkspaceLevel = await this.keyValuePairService.get({
        type: KeyValuePairType.USER_VARIABLE,
        userId: null,
        workspaceId,
        key,
      });
    }

    if (userVarWorkspaceLevel.length > 1) {
      throw new Error(
        `Multiple values found for key ${key} at workspace level`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userVarUserLevel: any[] = [];

    if (userId) {
      userVarUserLevel = await this.keyValuePairService.get({
        type: KeyValuePairType.USER_VARIABLE,
        userId,
        workspaceId: null,
        key,
      });
    }

    if (userVarUserLevel.length > 1) {
      throw new Error(`Multiple values found for key ${key} at user level`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userVarWorkspaceAndUserLevel: any[] = [];

    if (userId && workspaceId) {
      userVarWorkspaceAndUserLevel = await this.keyValuePairService.get({
        type: KeyValuePairType.USER_VARIABLE,
        userId,
        workspaceId,
        key,
      });
    }

    if (userVarWorkspaceAndUserLevel.length > 1) {
      throw new Error(
        `Multiple values found for key ${key} at workspace and user level`,
      );
    }

    return mergeUserVars([
      ...userVarUserLevel,
      ...userVarWorkspaceLevel,
      ...userVarWorkspaceAndUserLevel,
    ]).get(key) as KeyValueTypesMap[K];
  }

  public async getAll({
    userId,
    workspaceId,
  }: {
    userId?: string;
    workspaceId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<Map<Extract<keyof KeyValueTypesMap, string>, any>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any[] = [];

    if (userId) {
      result = [
        ...result,
        ...(await this.keyValuePairService.get({
          type: KeyValuePairType.USER_VARIABLE,
          userId,
          workspaceId: null,
        })),
      ];
    }

    if (workspaceId) {
      result = [
        ...result,
        ...(await this.keyValuePairService.get({
          type: KeyValuePairType.USER_VARIABLE,
          userId: null,
          workspaceId,
        })),
      ];
    }

    if (workspaceId && userId) {
      result = [
        ...result,
        ...(await this.keyValuePairService.get({
          type: KeyValuePairType.USER_VARIABLE,
          userId,
          workspaceId,
        })),
      ];
    }

    return mergeUserVars<Extract<keyof KeyValueTypesMap, string>>(result);
  }

  set<K extends keyof KeyValueTypesMap>(
    {
      userId,
      workspaceId,
      key,
      value,
    }: {
      userId?: string;
      workspaceId?: string;
      key: Extract<K, string>;
      value: KeyValueTypesMap[K];
    },
    queryRunner?: QueryRunner,
  ) {
    return this.keyValuePairService.set(
      {
        userId,
        workspaceId,
        key: key,
        value,
        type: KeyValuePairType.USER_VARIABLE,
      },
      queryRunner,
    );
  }

  async delete(
    {
      userId,
      workspaceId,
      key,
    }: {
      userId?: string;
      workspaceId?: string;
      key: Extract<keyof KeyValueTypesMap, string>;
    },
    queryRunner?: QueryRunner,
  ) {
    return this.keyValuePairService.delete(
      {
        userId,
        workspaceId,
        key,
        type: KeyValuePairType.USER_VARIABLE,
      },
      queryRunner,
    );
  }
}
