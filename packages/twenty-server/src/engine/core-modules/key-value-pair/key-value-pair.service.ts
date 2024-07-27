import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import {
  KeyValuePair,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

export class KeyValuePairService<
  KeyValueTypesMap extends Record<string, any> = Record<string, any>,
> {
  constructor(
    @InjectRepository(KeyValuePair, 'core')
    private readonly keyValuePairRepository: Repository<KeyValuePair>,
  ) {}

  async get<K extends keyof KeyValueTypesMap>({
    userId,
    workspaceId,
    type,
    key,
  }: {
    userId?: string | null;
    workspaceId?: string | null;
    type: KeyValuePairType;
    key?: Extract<K, string>;
  }): Promise<Array<KeyValueTypesMap[K]>> {
    const keyValuePairs = (await this.keyValuePairRepository.find({
      where: {
        ...(userId === undefined
          ? {}
          : userId === null
            ? { userId: IsNull() }
            : { userId }),
        ...(workspaceId === undefined
          ? {}
          : workspaceId === null
            ? { workspaceId: IsNull() }
            : { workspaceId }),
        ...(key === undefined ? {} : { key }),
        type,
      },
    })) as Array<KeyValueTypesMap[K]>;

    return keyValuePairs.map((keyValuePair) => ({
      ...keyValuePair,
      value: keyValuePair.value ?? keyValuePair.textValueDeprecated,
    }));
  }

  async set<K extends keyof KeyValueTypesMap>({
    userId,
    workspaceId,
    key,
    value,
    type,
  }: {
    userId?: string | null;
    workspaceId?: string | null;
    key: Extract<K, string>;
    value: KeyValueTypesMap[K];
    type: KeyValuePairType;
  }) {
    const upsertData = {
      userId,
      workspaceId,
      key,
      value,
      type,
    };

    const conflictPaths = Object.keys(upsertData).filter(
      (key) =>
        ['userId', 'workspaceId', 'key'].includes(key) &&
        upsertData[key] !== undefined,
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

  async delete({
    userId,
    workspaceId,
    type,
    key,
  }: {
    userId?: string | null;
    workspaceId?: string | null;
    type: KeyValuePairType;
    key: Extract<keyof KeyValueTypesMap, string>;
  }) {
    await this.keyValuePairRepository.delete({
      ...(userId === undefined
        ? {}
        : userId === null
          ? { userId: IsNull() }
          : { userId }),
      ...(workspaceId === undefined
        ? {}
        : workspaceId === null
          ? { workspaceId: IsNull() }
          : { workspaceId }),
      type,
      key,
    });
  }
}
