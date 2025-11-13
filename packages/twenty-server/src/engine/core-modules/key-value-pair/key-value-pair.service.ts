import { InjectRepository } from '@nestjs/typeorm';

import { type QueryRunner, IsNull, Repository } from 'typeorm';

import {
  KeyValuePairEntity,
  type KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

export class KeyValuePairService<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  KeyValueTypesMap extends Record<string, any> = Record<string, any>,
> {
  constructor(
    @InjectRepository(KeyValuePairEntity)
    private readonly keyValuePairRepository: Repository<KeyValuePairEntity>,
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

  async set<K extends keyof KeyValueTypesMap>(
    {
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
    },
    queryRunner?: QueryRunner,
  ) {
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
        // @ts-expect-error legacy noImplicitAny
        upsertData[key] !== undefined,
    );

    const indexPredicate = !userId
      ? '"userId" is NULL'
      : !workspaceId
        ? '"workspaceId" is NULL'
        : undefined;

    if (queryRunner) {
      await queryRunner.manager
        .getRepository(KeyValuePairEntity)
        .upsert(upsertData, {
          conflictPaths,
          indexPredicate,
        });
    } else {
      await this.keyValuePairRepository.upsert(upsertData, {
        conflictPaths,
        indexPredicate,
      });
    }
  }

  async delete(
    {
      userId,
      workspaceId,
      type,
      key,
    }: {
      userId?: string | null;
      workspaceId?: string | null;
      type: KeyValuePairType;
      key: Extract<keyof KeyValueTypesMap, string>;
    },
    queryRunner?: QueryRunner,
  ) {
    const deleteConditions = {
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
    };

    if (queryRunner) {
      await queryRunner.manager
        .getRepository(KeyValuePairEntity)
        .delete(deleteConditions);
    } else {
      await this.keyValuePairRepository.delete(deleteConditions);
    }
  }
}
