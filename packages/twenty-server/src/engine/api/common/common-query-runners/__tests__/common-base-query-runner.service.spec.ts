import {
  FieldMetadataType,
  type ObjectRecord,
  RelationType,
} from 'twenty-shared/types';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  type CommonExtendedInput,
  type CommonInput,
  CommonQueryNames,
  type CreateOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import {
  type ORMWorkspaceContext,
  withWorkspaceContext,
} from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const RECORD_ID = '20202020-0000-4000-8000-000000000002';
const OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000003';
const OBJECT_METADATA_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-000000000004';

const authContext = {
  type: 'system',
  workspace: { id: WORKSPACE_ID },
} as WorkspaceAuthContext;

const rolePermissionConfig = { shouldBypassPermissionChecks: true } as const;

const flatObjectMetadata = {
  id: OBJECT_METADATA_ID,
  universalIdentifier: OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
  nameSingular: 'person',
  fieldIds: [],
  isSystem: false,
} as unknown as FlatObjectMetadata;

const flatObjectMetadataMaps = {
  byUniversalIdentifier: {
    [OBJECT_METADATA_UNIVERSAL_IDENTIFIER]: flatObjectMetadata,
  },
  universalIdentifierById: {
    [OBJECT_METADATA_ID]: OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
  },
  universalIdentifiersByApplicationId: {},
} as FlatEntityMaps<FlatObjectMetadata>;

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
} as FlatEntityMaps<OrmFlatFieldMetadata>;

const baseQueryRunnerContext: CommonBaseQueryRunnerContext = {
  authContext,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectIdByNameSingular: {
    [flatObjectMetadata.nameSingular]: flatObjectMetadata.id,
  },
  rolePermissionConfig,
};

const workspaceContext = {
  authContext,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectIdByNameSingular: baseQueryRunnerContext.objectIdByNameSingular,
  featureFlagsMap: {},
  userWorkspaceRoleMap: {},
  apiKeyRoleMap: {},
} as unknown as ORMWorkspaceContext;

class TestCommonBaseQueryRunnerService extends CommonBaseQueryRunnerService<
  CreateOneQueryArgs,
  ObjectRecord
> {
  protected readonly operationName = CommonQueryNames.CREATE_ONE;

  public readonly runContexts: CommonExtendedQueryRunnerContext[] = [];

  public async run(
    _args: CommonExtendedInput<CreateOneQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord> {
    this.runContexts.push(queryRunnerContext);

    return { id: RECORD_ID };
  }

  public async validate(
    _args: CommonInput<CreateOneQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {}

  public async computeArgs(
    args: CommonInput<CreateOneQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<CreateOneQueryArgs>> {
    return args;
  }

  public async processQueryResult(
    queryResult: ObjectRecord,
  ): Promise<ObjectRecord> {
    return queryResult;
  }

  public resolveNestedRelationsForTest({
    records,
    queryRunnerContext,
    writeRepository,
  }: {
    records: Partial<ObjectRecord>[];
    queryRunnerContext: CommonExtendedQueryRunnerContext;
    writeRepository: WorkspaceRepository;
  }) {
    return this.resolveNestedRelations({
      records,
      queryRunnerContext,
      writeRepository,
    });
  }
}

describe('CommonBaseQueryRunnerService', () => {
  let service: TestCommonBaseQueryRunnerService;
  let globalRepository: WorkspaceRepository<ObjectRecord>;
  let executePostQueryHooks: jest.Mock;
  let getGlobalRepository: jest.Mock;

  const execute = (transactionScope?: WorkspaceTransactionScope) =>
    service.execute(
      {
        data: { id: RECORD_ID },
        selectedFields: {},
      },
      {
        ...baseQueryRunnerContext,
        transactionScope,
      },
    );

  beforeEach(() => {
    globalRepository = {
      repositoryKind: 'global',
    } as unknown as WorkspaceRepository<ObjectRecord>;
    executePostQueryHooks = jest.fn();
    getGlobalRepository = jest.fn().mockReturnValue(globalRepository);

    service = new TestCommonBaseQueryRunnerService();

    Object.assign(service, {
      workspaceQueryHookService: {
        executePreQueryHooks: jest.fn(
          (_hookAuthContext, _objectMetadataName, _operationName, payload) =>
            payload,
        ),
        executePostQueryHooks,
      },
      workspaceOrmManager: {
        executeInWorkspaceContext: jest.fn((work: () => unknown) =>
          withWorkspaceContext(workspaceContext, work),
        ),
        getRepository: getGlobalRepository,
      },
      featureFlagService: {
        isFeatureEnabled: jest.fn().mockResolvedValue(false),
      },
      twentyConfigService: {
        get: jest.fn().mockReturnValue(100),
      },
    });
  });

  it('uses the transaction-scoped repository without looking up a global repository', async () => {
    const transactionRepository = {
      repositoryKind: 'transaction',
    } as unknown as WorkspaceRepository<ObjectRecord>;
    const getTransactionRepository = jest
      .fn()
      .mockReturnValue(transactionRepository);
    const transactionScope = {
      getRepository: getTransactionRepository,
      executeRawQuery: jest.fn(),
    } as unknown as WorkspaceTransactionScope;

    await execute(transactionScope);

    expect(getTransactionRepository).toHaveBeenCalledWith(
      flatObjectMetadata.nameSingular,
      rolePermissionConfig,
    );
    expect(getGlobalRepository).not.toHaveBeenCalled();
    expect(service.runContexts).toHaveLength(1);
    expect(service.runContexts[0].repository).toBe(transactionRepository);
  });

  it('keeps required post-query hooks on the awaited transaction path', async () => {
    const postQueryHookError = new Error('post-query hook failed');
    const transactionScope = {
      getRepository: jest.fn().mockReturnValue(globalRepository),
      executeRawQuery: jest.fn(),
    } as unknown as WorkspaceTransactionScope;

    executePostQueryHooks.mockRejectedValueOnce(postQueryHookError);

    await expect(execute(transactionScope)).rejects.toBe(postQueryHookError);

    expect(executePostQueryHooks).toHaveBeenCalledWith(
      authContext,
      flatObjectMetadata.nameSingular,
      CommonQueryNames.CREATE_ONE,
      { id: RECORD_ID },
    );
  });

  it('uses the global repository and executes post-query hooks immediately without a transaction', async () => {
    await expect(execute()).resolves.toMatchObject({
      results: { id: RECORD_ID },
    });

    expect(getGlobalRepository).toHaveBeenCalledWith(
      flatObjectMetadata.nameSingular,
      rolePermissionConfig,
      { useReplica: false },
    );
    expect(service.runContexts).toHaveLength(1);
    expect(service.runContexts[0].repository).toBe(globalRepository);
    expect(executePostQueryHooks).toHaveBeenCalledWith(
      authContext,
      flatObjectMetadata.nameSingular,
      CommonQueryNames.CREATE_ONE,
      { id: RECORD_ID },
    );
  });

  it('uses the write repository to look up the repository for a nested relation target', async () => {
    const companyObjectMetadataId = '20202020-0000-4000-8000-000000000005';
    const companyObjectMetadataUniversalIdentifier =
      '20202020-0000-4000-8000-000000000006';
    const companyFieldMetadataId = '20202020-0000-4000-8000-000000000007';
    const companyFieldMetadataUniversalIdentifier =
      '20202020-0000-4000-8000-000000000008';
    const companyIdFieldMetadataId = '20202020-0000-4000-8000-000000000009';
    const companyIdFieldMetadataUniversalIdentifier =
      '20202020-0000-4000-8000-000000000010';
    const companyRecordId = '20202020-0000-4000-8000-000000000011';
    const personObjectMetadata = {
      ...flatObjectMetadata,
      fieldIds: [companyFieldMetadataId],
      indexMetadataIds: [],
    } as FlatObjectMetadata;
    const companyObjectMetadata = {
      id: companyObjectMetadataId,
      universalIdentifier: companyObjectMetadataUniversalIdentifier,
      nameSingular: 'company',
      fieldIds: [companyIdFieldMetadataId],
      indexMetadataIds: [],
    } as unknown as FlatObjectMetadata;
    const companyFieldMetadata = {
      id: companyFieldMetadataId,
      universalIdentifier: companyFieldMetadataUniversalIdentifier,
      name: 'company',
      type: FieldMetadataType.RELATION,
      objectMetadataId: personObjectMetadata.id,
      relationTargetObjectMetadataId: companyObjectMetadata.id,
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        joinColumnName: 'companyId',
      },
    } as OrmFlatFieldMetadata;
    const companyIdFieldMetadata = {
      id: companyIdFieldMetadataId,
      universalIdentifier: companyIdFieldMetadataUniversalIdentifier,
      name: 'id',
      type: FieldMetadataType.UUID,
      objectMetadataId: companyObjectMetadata.id,
    } as OrmFlatFieldMetadata;
    const relationObjectMetadataMaps = {
      byUniversalIdentifier: {
        [personObjectMetadata.universalIdentifier]: personObjectMetadata,
        [companyObjectMetadata.universalIdentifier]: companyObjectMetadata,
      },
      universalIdentifierById: {
        [personObjectMetadata.id]: personObjectMetadata.universalIdentifier,
        [companyObjectMetadata.id]: companyObjectMetadata.universalIdentifier,
      },
      universalIdentifiersByApplicationId: {},
    } as FlatEntityMaps<FlatObjectMetadata>;
    const relationFieldMetadataMaps = {
      byUniversalIdentifier: {
        [companyFieldMetadata.universalIdentifier]: companyFieldMetadata,
        [companyIdFieldMetadata.universalIdentifier]: companyIdFieldMetadata,
      },
      universalIdentifierById: {
        [companyFieldMetadata.id]: companyFieldMetadata.universalIdentifier,
        [companyIdFieldMetadata.id]: companyIdFieldMetadata.universalIdentifier,
      },
      universalIdentifiersByApplicationId: {},
    } as FlatEntityMaps<OrmFlatFieldMetadata>;
    const flatIndexMaps = {
      byUniversalIdentifier: {},
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    } as FlatEntityMaps<FlatIndexMetadata>;
    const getRawMany = jest.fn().mockResolvedValue([{ id: companyRecordId }]);
    const targetQueryBuilder = {
      select: jest.fn(),
      addSelect: jest.fn(),
      where: jest.fn(),
      getRawMany,
    };

    targetQueryBuilder.where.mockReturnValue(targetQueryBuilder);

    const relatedRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(targetQueryBuilder),
    };
    const getRepositoryForObjectMetadataId = jest
      .fn()
      .mockReturnValue(relatedRepository);
    const writeRepository = {
      internalContext: {
        workspaceId: WORKSPACE_ID,
        flatObjectMetadataMaps: relationObjectMetadataMaps,
        flatFieldMetadataMaps: relationFieldMetadataMaps,
        flatIndexMaps,
        objectIdByNameSingular: {
          person: personObjectMetadata.id,
          company: companyObjectMetadata.id,
        },
      },
      getRepositoryForObjectMetadataId,
    } as unknown as WorkspaceRepository;

    await expect(
      service.resolveNestedRelationsForTest({
        records: [
          {
            company: {
              connect: { where: { id: companyRecordId } },
            },
          },
        ],
        queryRunnerContext: {
          flatObjectMetadata: personObjectMetadata,
          flatFieldMetadataMaps: relationFieldMetadataMaps,
        } as CommonExtendedQueryRunnerContext,
        writeRepository,
      }),
    ).resolves.toEqual([{ companyId: companyRecordId }]);

    expect(getRepositoryForObjectMetadataId).toHaveBeenCalledWith(
      companyObjectMetadata.id,
    );
    expect(relatedRepository.createQueryBuilder).toHaveBeenCalledWith(
      companyObjectMetadata.nameSingular,
    );
    expect(getRawMany).toHaveBeenCalledTimes(1);
  });
});
