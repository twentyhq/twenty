import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import {
  KeyValuePair,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { mergeUserVars } from 'src/engine/core-modules/user/utils/merge-user-vars.util';

@Injectable()
export class UserVarService {
  constructor(
    @InjectRepository(KeyValuePair, 'core')
    private readonly keyValuePairRepository: Repository<KeyValuePair>,
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
}
