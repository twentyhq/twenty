import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import {
  KeyValuePair,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

@Injectable()
export class UserVarService {
  constructor(
    @InjectRepository(KeyValuePair, 'core')
    private readonly keyValuePairRepository: Repository<KeyValuePair>,
  ) {}

  private async getWorkspaceUserVar(
    workspaceId: string,
  ): Promise<Map<string, any>> {
    const workspaceKeyValuePairs = await this.keyValuePairRepository.find({
      select: ['key', 'value'],
      where: {
        userId: IsNull(),
        workspaceId,
        type: KeyValuePairType.USER_VAR,
      },
    });

    return new Map<string, any>(
      workspaceKeyValuePairs.map(({ key, value }) => [key, value]),
    );
  }

  private async getUserVar(userId: string): Promise<Map<string, any>> {
    const userKeyValuePair = await this.keyValuePairRepository.find({
      select: ['key', 'value'],
      where: {
        userId,
        type: KeyValuePairType.USER_VAR,
      },
    });

    return new Map<string, any>(
      userKeyValuePair.map(({ key, value }) => [key, value]),
    );
  }

  async getUserVars(
    userId: string,
    workspaceId: string,
  ): Promise<Map<string, any>> {
    const workspaceVar = await this.getWorkspaceUserVar(workspaceId);
    const userVar = await this.getUserVar(userId);

    const userVars = new Map<string, any>([...workspaceVar, ...userVar]);

    return userVars;
  }
}
