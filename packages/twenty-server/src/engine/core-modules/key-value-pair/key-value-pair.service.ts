import { InjectRepository } from '@nestjs/typeorm';

import { type QueryRunner, IsNull, Repository } from 'typeorm';

import {
  KeyValuePairEntity,
  type KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

export class KeyValuePairService<
  // oxlint-disable-next-line typescript/no-explicit-any
  KeyValueTypesMap extends Record<string, any> = Record<string, any>,
> {
  constructor(
    @InjectRepository(KeyValuePairEntity)
    private readonly keyValuePairRepository: Repository<KeyValuePairEntity>,
  ) {}

  async get<K extends keyof KeyValueTypesMap>({
    userId,
    workspaceId,
    applicationId,
    type,
    key,
  }: {
    userId?: string | null;
    workspaceId?: string | null;
    applicationId?: string | null;
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
        ...(applicationId == null
          ? { applicationId: IsNull() }
          : { applicationId }),
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
      applicationId,
      key,
      value,
      type,
    }: {
      userId?: string | null;
      workspaceId?: string | null;
      applicationId?: string | null;
      key: Extract<K, string>;
      value: KeyValueTypesMap[K];
      type: KeyValuePairType;
    },
    queryRunner?: QueryRunner,
  ) {
    const normalizedUserId = userId ?? null;
    const normalizedWorkspaceId = workspaceId ?? null;
    const normalizedApplicationId = applicationId ?? null;
    const hasNullUserAndWorkspaceAndApplication =
      normalizedUserId === null &&
      normalizedWorkspaceId === null &&
      normalizedApplicationId === null;
    const keyValuePairRepository = queryRunner
      ? queryRunner.manager.getRepository(KeyValuePairEntity)
      : this.keyValuePairRepository;

    const upsertData = {
      userId: normalizedUserId,
      workspaceId: normalizedWorkspaceId,
      applicationId: normalizedApplicationId,
      key,
      value,
      type,
    };

    const conflictPaths: string[] = ['key'];
    let indexPredicate: string | undefined;

    if (normalizedApplicationId !== null) {
      conflictPaths.push('applicationId');
      indexPredicate =
        normalizedWorkspaceId === null
          ? '"applicationId" IS NOT NULL AND "workspaceId" IS NULL'
          : '"applicationId" IS NOT NULL AND "workspaceId" IS NOT NULL';
    } else if (hasNullUserAndWorkspaceAndApplication) {
      indexPredicate =
        '"userId" IS NULL AND "workspaceId" IS NULL AND "applicationId" IS NULL';
    } else if (normalizedUserId === null) {
      conflictPaths.push('workspaceId');
      indexPredicate = '"userId" IS NULL AND "applicationId" IS NULL';
    } else if (normalizedWorkspaceId === null) {
      conflictPaths.push('userId');
      indexPredicate = '"workspaceId" IS NULL';
    } else {
      conflictPaths.push('userId', 'workspaceId');
    }

    await keyValuePairRepository.upsert(upsertData, {
      conflictPaths,
      indexPredicate,
    });
  }

  async delete(
    {
      userId,
      workspaceId,
      applicationId,
      type,
      key,
    }: {
      userId?: string | null;
      workspaceId?: string | null;
      applicationId?: string | null;
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
      // Application rows are isolated from core key-value pairs: without an
      // explicit applicationId we only match rows where it is NULL.
      ...(applicationId == null
        ? { applicationId: IsNull() }
        : { applicationId }),
      type,
      key,
    };

    const { affected } = queryRunner
      ? await queryRunner.manager
          .getRepository(KeyValuePairEntity)
          .delete(deleteConditions)
      : await this.keyValuePairRepository.delete(deleteConditions);

    return affected;
  }
}
