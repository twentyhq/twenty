import { InjectRepository } from '@nestjs/typeorm';

import { type QueryRunner, IsNull, Repository } from 'typeorm';

import {
  KeyValuePairEntity,
  type KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

export class KeyValuePairService<
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
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
    const normalizedUserId = userId ?? null;
    const normalizedWorkspaceId = workspaceId ?? null;
    const hasNullUserAndWorkspace =
      normalizedUserId === null && normalizedWorkspaceId === null;
    const keyValuePairRepository = queryRunner
      ? queryRunner.manager.getRepository(KeyValuePairEntity)
      : this.keyValuePairRepository;

    const upsertData = {
      userId: normalizedUserId,
      workspaceId: normalizedWorkspaceId,
      key,
      value,
      type,
    };

    if (hasNullUserAndWorkspace) {
      const existingKeyValuePair = await keyValuePairRepository.findOne({
        where: {
          userId: IsNull(),
          workspaceId: IsNull(),
          key,
          type,
        },
      });

      if (existingKeyValuePair) {
        await keyValuePairRepository.update(existingKeyValuePair.id, {
          value,
        });

        return;
      }

      await keyValuePairRepository.insert(upsertData);

      return;
    }

    const conflictPaths = Object.keys(upsertData).filter(
      (conflictPath) =>
        ['userId', 'workspaceId', 'key'].includes(conflictPath) &&
        // @ts-expect-error legacy noImplicitAny
        upsertData[conflictPath] !== undefined,
    );

    const indexPredicate =
      normalizedUserId === null
        ? '"userId" is NULL'
        : normalizedWorkspaceId === null
          ? '"workspaceId" is NULL'
          : undefined;

    await keyValuePairRepository.upsert(upsertData, {
      conflictPaths,
      indexPredicate,
    });
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
