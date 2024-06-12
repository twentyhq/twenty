import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

import { Repository } from 'typeorm';

import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

export class KeyValuePairService<TYPE> {
  constructor(
    @InjectRepository(KeyValuePair, 'core')
    private readonly keyValuePairRepository: Repository<KeyValuePair>,
  ) {}

  async get<K extends keyof TYPE>({
    userId,
    workspaceId,
    key,
  }: {
    userId?: string;
    workspaceId?: string;
    key: K;
  }): Promise<TYPE[K] | undefined> {
    return (
      await this.keyValuePairRepository.findOne({
        where: {
          userId,
          workspaceId,
          key: key as string,
        },
      })
    )?.value as TYPE[K] | undefined;
  }

  async set<K extends keyof TYPE>({
    userId,
    workspaceId,
    key,
    value,
  }: {
    userId?: string;
    workspaceId?: string;
    key: K;
    value: TYPE[K];
  }) {
    if (!userId && !workspaceId) {
      throw new BadRequestException('userId and workspaceId are undefined');
    }
    const upsertData = {
      userId,
      workspaceId,
      key: key as string,
      value: value as string,
    };

    const conflictPaths = Object.keys(upsertData).filter(
      (key) => key !== 'value' && upsertData[key] !== undefined,
    );

    const indexPredicate = !userId
      ? '"userId" is NULL'
      : !workspaceId
        ? '"workspaceId" is NULL'
        : undefined;

    await this.keyValuePairRepository.upsert(upsertData, {
      conflictPaths,
      indexPredicate,
    });
  }
}
