import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import {
  KeyValuePair,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { mergeUserVars } from 'src/engine/core-modules/user/utils/merge-user-vars.util';

@Injectable()
export class UserVarService<T> {
  constructor(
    @InjectRepository(KeyValuePair, 'core')
    private readonly keyValuePairRepository: Repository<KeyValuePair>,
    private readonly keyValuePairService: KeyValuePairService<T>,
  ) {}

  public async getUserVars(
    userId: string,
    workspaceId: string,
  ): Promise<Map<string, any>> {
    const userVars = await this.keyValuePairRepository.find({
      select: ['key', 'value', 'userId', 'workspaceId'],
      where: [
        {
          userId,
          workspaceId,
          type: KeyValuePairType.USER_VAR,
        },
        {
          userId,
          workspaceId: IsNull(),
          type: KeyValuePairType.USER_VAR,
        },
        {
          userId: IsNull(),
          workspaceId,
          type: KeyValuePairType.USER_VAR,
        },
      ],
    });

    return mergeUserVars(userVars);
  }

  set<K extends keyof T>({
    userId,
    workspaceId,
    key,
    value,
  }: {
    userId?: string;
    workspaceId?: string;
    key: K;
    value: T[K];
  }) {
    return this.keyValuePairRepository.save({
      userId,
      workspaceId,
      key: key as string,
      value: value as JSON,
      type: KeyValuePairType.USER_VAR,
    });
  }

  async get<K extends keyof T>({
    userId,
    workspaceId,
    key,
  }: {
    userId?: string;
    workspaceId?: string;
    key: K;
  }): Promise<T[K] | undefined> {
    return this.keyValuePairService.get({
      userId,
      workspaceId,
      key,
    });
  }

  async delete({
    userId,
    workspaceId,
    key,
  }: {
    userId?: string;
    workspaceId?: string;
    key: string;
  }) {
    return this.keyValuePairRepository.delete({
      userId,
      workspaceId,
      key,
      type: KeyValuePairType.USER_VAR,
    });
  }
}
