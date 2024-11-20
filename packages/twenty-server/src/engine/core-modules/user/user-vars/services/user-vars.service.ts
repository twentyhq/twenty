import { Injectable } from '@nestjs/common';

import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { mergeUserVars } from 'src/engine/core-modules/user/user-vars/utils/merge-user-vars.util';

@Injectable()
export class UserVarsService<
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
    let userVarWorkspaceLevel: any[] = [];

    if (workspaceId) {
      userVarWorkspaceLevel = await this.keyValuePairService.get({
        type: KeyValuePairType.USER_VAR,
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

    let userVarUserLevel: any[] = [];

    if (userId) {
      userVarUserLevel = await this.keyValuePairService.get({
        type: KeyValuePairType.USER_VAR,
        userId,
        workspaceId: null,
        key,
      });
    }

    if (userVarUserLevel.length > 1) {
      throw new Error(`Multiple values found for key ${key} at user level`);
    }

    let userVarWorkspaceAndUserLevel: any[] = [];

    if (userId && workspaceId) {
      userVarWorkspaceAndUserLevel = await this.keyValuePairService.get({
        type: KeyValuePairType.USER_VAR,
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
  }): Promise<Map<Extract<keyof KeyValueTypesMap, string>, any>> {
    let result: any[] = [];

    if (userId) {
      result = [
        ...result,
        ...(await this.keyValuePairService.get({
          type: KeyValuePairType.USER_VAR,
          userId,
          workspaceId: null,
        })),
      ];
    }

    if (workspaceId) {
      result = [
        ...result,
        ...(await this.keyValuePairService.get({
          type: KeyValuePairType.USER_VAR,
          userId: null,
          workspaceId,
        })),
      ];
    }

    if (workspaceId && userId) {
      result = [
        ...result,
        ...(await this.keyValuePairService.get({
          type: KeyValuePairType.USER_VAR,
          userId,
          workspaceId,
        })),
      ];
    }

    return mergeUserVars<Extract<keyof KeyValueTypesMap, string>>(result);
  }

  set<K extends keyof KeyValueTypesMap>({
    userId,
    workspaceId,
    key,
    value,
  }: {
    userId?: string;
    workspaceId?: string;
    key: Extract<K, string>;
    value: KeyValueTypesMap[K];
  }) {
    return this.keyValuePairService.set({
      userId,
      workspaceId,
      key: key,
      value,
      type: KeyValuePairType.USER_VAR,
    });
  }

  async delete({
    userId,
    workspaceId,
    key,
  }: {
    userId?: string;
    workspaceId?: string;
    key: Extract<keyof KeyValueTypesMap, string>;
  }) {
    return this.keyValuePairService.delete({
      userId,
      workspaceId,
      key,
      type: KeyValuePairType.USER_VAR,
    });
  }
}
