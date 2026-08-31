import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import { CommonQueryRunnerExceptionCode } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CreateAndConnectJunctionRecordInput } from 'src/engine/core-modules/record-crud/dtos/create-and-connect-junction-record.input';
import { type CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { CreateAndConnectJunctionRecordService } from 'src/engine/core-modules/record-crud/services/create-and-connect-junction-record.service';
import { type CommonApiContext } from 'src/engine/core-modules/record-crud/types/common-api-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type ORMWorkspaceContext,
  withWorkspaceContext,
} from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

type FlatEntityFixture = {
  id: string;
  universalIdentifier: string;
};

const buildFlatEntityMaps = <T extends FlatEntityFixture>(
  flatEntities: T[],
): FlatEntityMaps<never> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.universalIdentifier,
        flatEntity,
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.id,
        flatEntity.universalIdentifier,
      ]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatEntityMaps<never>;

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const SOURCE_RECORD_ID = '20202020-0000-4000-8000-000000000002';
const TARGET_RECORD_ID = '20202020-0000-4000-8000-000000000003';
const JUNCTION_RECORD_ID = '20202020-0000-4000-8000-000000000004';

const SOURCE_OBJECT = {
  id: 'source-object-id',
  universalIdentifier: 'source-object-uid',
  nameSingular: 'task',
  fieldIds: ['source-junctions-field-id'],
};

const JUNCTION_OBJECT = {
  id: 'junction-object-id',
  universalIdentifier: 'junction-object-uid',
  nameSingular: 'taskTarget',
  fieldIds: [
    'junction-source-field-id',
    'junction-target-field-id',
    'junction-target-company-field-id',
  ],
};

const TARGET_OBJECT = {
  id: 'target-object-id',
  universalIdentifier: 'target-object-uid',
  nameSingular: 'person',
  fieldIds: ['person-task-targets-field-id'],
};

const OTHER_TARGET_OBJECT = {
  id: 'other-target-object-id',
  universalIdentifier: 'other-target-object-uid',
  nameSingular: 'company',
  fieldIds: [],
};

const SOURCE_JUNCTIONS_FIELD = {
  id: 'source-junctions-field-id',
  universalIdentifier: 'source-junctions-field-uid',
  name: 'taskTargets',
  type: FieldMetadataType.RELATION,
  objectMetadataId: SOURCE_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: JUNCTION_OBJECT.id,
  relationTargetFieldMetadataId: 'junction-source-field-id',
  settings: {
    relationType: RelationType.ONE_TO_MANY,
    junctionTargetFieldId: 'junction-target-field-id',
  },
};

const JUNCTION_SOURCE_FIELD = {
  id: 'junction-source-field-id',
  universalIdentifier: 'junction-source-field-uid',
  name: 'task',
  type: FieldMetadataType.RELATION,
  objectMetadataId: JUNCTION_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: SOURCE_OBJECT.id,
  relationTargetFieldMetadataId: SOURCE_JUNCTIONS_FIELD.id,
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'taskId',
  },
};

const JUNCTION_TARGET_FIELD = {
  id: 'junction-target-field-id',
  universalIdentifier: 'junction-target-field-uid',
  name: 'person',
  type: FieldMetadataType.RELATION,
  objectMetadataId: JUNCTION_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: TARGET_OBJECT.id,
  relationTargetFieldMetadataId: 'person-task-targets-field-id',
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'personId',
  },
};

const REVERSE_JUNCTIONS_FIELD = {
  id: 'person-task-targets-field-id',
  universalIdentifier: 'person-task-targets-field-uid',
  name: 'taskTargets',
  type: FieldMetadataType.RELATION,
  objectMetadataId: TARGET_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: JUNCTION_OBJECT.id,
  relationTargetFieldMetadataId: JUNCTION_TARGET_FIELD.id,
  settings: {
    relationType: RelationType.ONE_TO_MANY,
  },
};

const JUNCTION_MORPH_TARGET_FIELD = {
  ...JUNCTION_TARGET_FIELD,
  type: FieldMetadataType.MORPH_RELATION,
  morphId: 'target-morph-id',
  name: 'targetPerson',
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetPersonId',
  },
};

const JUNCTION_MORPH_COMPANY_FIELD = {
  id: 'junction-target-company-field-id',
  universalIdentifier: 'junction-target-company-field-uid',
  name: 'targetCompany',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: JUNCTION_OBJECT.id,
  morphId: 'target-morph-id',
  relationTargetObjectMetadataId: OTHER_TARGET_OBJECT.id,
  relationTargetFieldMetadataId: 'company-task-targets-field-id',
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetCompanyId',
  },
};

const OTHER_REVERSE_JUNCTIONS_FIELD = {
  id: 'company-task-targets-field-id',
  universalIdentifier: 'company-task-targets-field-uid',
  name: 'taskTargets',
  type: FieldMetadataType.RELATION,
  objectMetadataId: OTHER_TARGET_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: JUNCTION_OBJECT.id,
  relationTargetFieldMetadataId: JUNCTION_MORPH_COMPANY_FIELD.id,
  settings: {
    relationType: RelationType.ONE_TO_MANY,
  },
};

const authContext = {
  type: 'system',
  workspace: { id: WORKSPACE_ID },
} as WorkspaceAuthContext;

const rolePermissionConfig = { shouldBypassPermissionChecks: true } as const;
const targetSelectedFields = { id: true, name: true };
const junctionSelectedFields = { id: true };
const targetQueryRunnerContext = {
  testContext: 'target',
} as unknown as CommonBaseQueryRunnerContext;
const junctionQueryRunnerContext = {
  testContext: 'junction',
} as unknown as CommonBaseQueryRunnerContext;

describe('CreateAndConnectJunctionRecordService', () => {
  let service: CreateAndConnectJunctionRecordService;
  let workspaceContext: ORMWorkspaceContext;
  let commonCreateOneQueryRunnerService: { execute: jest.Mock };
  let commonApiContextBuilderService: { build: jest.Mock };
  let workspaceOrmManager: {
    executeInWorkspaceContext: jest.Mock;
    runInWorkspaceTransaction: jest.Mock;
  };
  let sourceRecordExists: jest.Mock;
  let getRepository: jest.Mock;
  let transactionScope: WorkspaceTransactionScope;
  let transactionFailureObserver: jest.Mock;

  const setWorkspaceMetadata = ({
    sourceField = SOURCE_JUNCTIONS_FIELD,
    targetFields = [JUNCTION_TARGET_FIELD],
    flatObjects = [
      SOURCE_OBJECT,
      JUNCTION_OBJECT,
      TARGET_OBJECT,
      OTHER_TARGET_OBJECT,
    ],
  }: {
    sourceField?: object;
    targetFields?: object[];
    flatObjects?: object[];
  } = {}) => {
    workspaceContext = {
      authContext,
      flatObjectMetadataMaps: buildFlatEntityMaps(
        flatObjects as FlatEntityFixture[],
      ) as unknown as FlatEntityMaps<FlatObjectMetadata>,
      flatFieldMetadataMaps: buildFlatEntityMaps([
        sourceField,
        JUNCTION_SOURCE_FIELD,
        ...targetFields,
        REVERSE_JUNCTIONS_FIELD,
        OTHER_REVERSE_JUNCTIONS_FIELD,
      ] as FlatEntityFixture[]) as unknown as FlatEntityMaps<OrmFlatFieldMetadata>,
      userWorkspaceRoleMap: {},
      apiKeyRoleMap: {},
    } as ORMWorkspaceContext;
  };

  const execute = (
    inputOverrides: Partial<CreateAndConnectJunctionRecordInput> = {},
  ) =>
    service.execute({
      input: {
        sourceRecordId: SOURCE_RECORD_ID,
        relationFieldMetadataId: SOURCE_JUNCTIONS_FIELD.id,
        targetRecordInput: {
          id: TARGET_RECORD_ID,
          name: 'Ada Lovelace',
        },
        ...inputOverrides,
      },
      authContext,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    setWorkspaceMetadata();

    sourceRecordExists = jest.fn().mockResolvedValue(true);
    getRepository = jest.fn().mockReturnValue({
      existsBy: sourceRecordExists,
    });
    transactionScope = {
      getRepository,
      executeRawQuery: jest.fn(),
    } as unknown as WorkspaceTransactionScope;
    transactionFailureObserver = jest.fn();

    commonCreateOneQueryRunnerService = {
      execute: jest
        .fn()
        .mockResolvedValueOnce({
          results: { id: TARGET_RECORD_ID, name: 'Ada Lovelace' },
        })
        .mockResolvedValueOnce({
          results: {
            id: JUNCTION_RECORD_ID,
            taskId: SOURCE_RECORD_ID,
            personId: TARGET_RECORD_ID,
          },
        }),
    };

    commonApiContextBuilderService = {
      build: jest.fn(
        async ({
          objectName,
        }: Parameters<CommonApiContextBuilderService['build']>[0]) => {
          if (
            objectName === TARGET_OBJECT.nameSingular ||
            objectName === SOURCE_OBJECT.nameSingular
          ) {
            return {
              queryRunnerContext: targetQueryRunnerContext,
              selectedFields: targetSelectedFields,
            } as unknown as CommonApiContext;
          }

          if (objectName === JUNCTION_OBJECT.nameSingular) {
            return {
              queryRunnerContext: junctionQueryRunnerContext,
              selectedFields: junctionSelectedFields,
            } as unknown as CommonApiContext;
          }

          throw new Error(`Unexpected object context: ${objectName}`);
        },
      ),
    };

    workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn((work: () => unknown) =>
        withWorkspaceContext(workspaceContext, work),
      ),
      runInWorkspaceTransaction: jest.fn(
        async (
          work: (
            transactionScope: WorkspaceTransactionScope,
          ) => Promise<unknown>,
        ) => {
          try {
            return await work(transactionScope);
          } catch (error) {
            transactionFailureObserver(error);
            throw error;
          }
        },
      ),
    };

    service = new CreateAndConnectJunctionRecordService(
      commonCreateOneQueryRunnerService as unknown as CommonCreateOneQueryRunnerService,
      commonApiContextBuilderService as unknown as CommonApiContextBuilderService,
      workspaceOrmManager as unknown as WorkspaceOrmManager,
    );
  });

  it('creates the target and regular junction in one transaction with derived IDs and join columns', async () => {
    await expect(execute()).resolves.toEqual({
      targetRecord: { id: TARGET_RECORD_ID, name: 'Ada Lovelace' },
      junctionRecord: {
        id: JUNCTION_RECORD_ID,
        taskId: SOURCE_RECORD_ID,
        personId: TARGET_RECORD_ID,
      },
    });

    expect(workspaceOrmManager.runInWorkspaceTransaction).toHaveBeenCalledTimes(
      1,
    );
    expect(getRepository).toHaveBeenCalledWith(
      SOURCE_OBJECT.nameSingular,
      rolePermissionConfig,
    );
    expect(sourceRecordExists).toHaveBeenCalledWith({ id: SOURCE_RECORD_ID });
    expect(commonCreateOneQueryRunnerService.execute).toHaveBeenCalledTimes(2);
    expect(commonCreateOneQueryRunnerService.execute).toHaveBeenNthCalledWith(
      1,
      {
        data: { id: TARGET_RECORD_ID, name: 'Ada Lovelace' },
        selectedFields: targetSelectedFields,
      },
      {
        ...targetQueryRunnerContext,
        transactionScope,
      },
    );
    expect(commonCreateOneQueryRunnerService.execute).toHaveBeenNthCalledWith(
      2,
      {
        data: {
          taskId: SOURCE_RECORD_ID,
          personId: TARGET_RECORD_ID,
        },
        selectedFields: junctionSelectedFields,
      },
      {
        ...junctionQueryRunnerContext,
        transactionScope,
      },
    );
    expect(commonApiContextBuilderService.build).toHaveBeenCalledWith({
      authContext,
      objectName: TARGET_OBJECT.nameSingular,
      rolePermissionConfig,
    });
    expect(commonApiContextBuilderService.build).toHaveBeenCalledWith({
      authContext,
      objectName: JUNCTION_OBJECT.nameSingular,
      rolePermissionConfig,
    });
  });

  it('propagates a pivot create failure through the transaction boundary', async () => {
    const pivotError = new Error('pivot create failed');

    commonCreateOneQueryRunnerService.execute
      .mockReset()
      .mockResolvedValueOnce({
        results: { id: TARGET_RECORD_ID, name: 'Ada Lovelace' },
      })
      .mockRejectedValueOnce(pivotError);

    await expect(execute()).rejects.toBe(pivotError);

    expect(workspaceOrmManager.runInWorkspaceTransaction).toHaveBeenCalledTimes(
      1,
    );
    expect(commonCreateOneQueryRunnerService.execute).toHaveBeenCalledTimes(2);
    expect(transactionFailureObserver).toHaveBeenCalledWith(pivotError);
  });

  it('creates and connects from a reverse visible field using the visible source permissions', async () => {
    commonCreateOneQueryRunnerService.execute
      .mockReset()
      .mockResolvedValueOnce({
        results: { id: TARGET_RECORD_ID, title: 'Follow up' },
      })
      .mockResolvedValueOnce({
        results: {
          id: JUNCTION_RECORD_ID,
          personId: SOURCE_RECORD_ID,
          taskId: TARGET_RECORD_ID,
        },
      });

    await expect(
      execute({
        relationFieldMetadataId: REVERSE_JUNCTIONS_FIELD.id,
        targetRecordInput: {
          id: TARGET_RECORD_ID,
          title: 'Follow up',
        },
      }),
    ).resolves.toEqual({
      targetRecord: { id: TARGET_RECORD_ID, title: 'Follow up' },
      junctionRecord: {
        id: JUNCTION_RECORD_ID,
        personId: SOURCE_RECORD_ID,
        taskId: TARGET_RECORD_ID,
      },
    });

    expect(getRepository).toHaveBeenCalledWith(
      TARGET_OBJECT.nameSingular,
      rolePermissionConfig,
    );
    expect(sourceRecordExists).toHaveBeenCalledWith({ id: SOURCE_RECORD_ID });
    expect(commonCreateOneQueryRunnerService.execute).toHaveBeenNthCalledWith(
      1,
      {
        data: { id: TARGET_RECORD_ID, title: 'Follow up' },
        selectedFields: targetSelectedFields,
      },
      {
        ...targetQueryRunnerContext,
        transactionScope,
      },
    );
    expect(commonCreateOneQueryRunnerService.execute).toHaveBeenNthCalledWith(
      2,
      {
        data: {
          personId: SOURCE_RECORD_ID,
          taskId: TARGET_RECORD_ID,
        },
        selectedFields: junctionSelectedFields,
      },
      {
        ...junctionQueryRunnerContext,
        transactionScope,
      },
    );
    expect(commonApiContextBuilderService.build).toHaveBeenCalledWith({
      authContext,
      objectName: SOURCE_OBJECT.nameSingular,
      rolePermissionConfig,
    });
  });

  it('does not create records when the reverse visible source is inaccessible', async () => {
    sourceRecordExists.mockResolvedValue(false);

    await expect(
      execute({ relationFieldMetadataId: REVERSE_JUNCTIONS_FIELD.id }),
    ).rejects.toMatchObject({
      code: CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      message: 'Source record not found',
    });

    expect(getRepository).toHaveBeenCalledWith(
      TARGET_OBJECT.nameSingular,
      rolePermissionConfig,
    );
    expect(commonCreateOneQueryRunnerService.execute).not.toHaveBeenCalled();
  });

  it('orients a reverse physical morph member before applying the regular target guard', async () => {
    setWorkspaceMetadata({
      targetFields: [JUNCTION_MORPH_TARGET_FIELD, JUNCTION_MORPH_COMPANY_FIELD],
    });
    commonCreateOneQueryRunnerService.execute
      .mockReset()
      .mockResolvedValueOnce({
        results: { id: TARGET_RECORD_ID, title: 'Follow up' },
      })
      .mockResolvedValueOnce({
        results: {
          id: JUNCTION_RECORD_ID,
          targetCompanyId: SOURCE_RECORD_ID,
          taskId: TARGET_RECORD_ID,
        },
      });

    await expect(
      execute({
        relationFieldMetadataId: OTHER_REVERSE_JUNCTIONS_FIELD.id,
        targetRecordInput: {
          id: TARGET_RECORD_ID,
          title: 'Follow up',
        },
      }),
    ).resolves.toMatchObject({
      junctionRecord: {
        targetCompanyId: SOURCE_RECORD_ID,
        taskId: TARGET_RECORD_ID,
      },
    });

    expect(getRepository).toHaveBeenCalledWith(
      OTHER_TARGET_OBJECT.nameSingular,
      rolePermissionConfig,
    );
    expect(commonCreateOneQueryRunnerService.execute).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: {
          targetCompanyId: SOURCE_RECORD_ID,
          taskId: TARGET_RECORD_ID,
        },
      }),
      expect.objectContaining({ transactionScope }),
    );
  });

  it('does not create either record when the source record is missing', async () => {
    sourceRecordExists.mockResolvedValue(false);

    await expect(execute()).rejects.toMatchObject({
      code: CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      message: 'Source record not found',
    });

    expect(workspaceOrmManager.runInWorkspaceTransaction).toHaveBeenCalledTimes(
      1,
    );
    expect(commonCreateOneQueryRunnerService.execute).not.toHaveBeenCalled();
    expect(transactionFailureObserver).toHaveBeenCalledWith(
      expect.objectContaining({
        code: CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      }),
    );
  });

  it('rejects a morph junction before opening a transaction', async () => {
    setWorkspaceMetadata({
      targetFields: [JUNCTION_MORPH_TARGET_FIELD, JUNCTION_MORPH_COMPANY_FIELD],
    });

    await expect(execute()).rejects.toMatchObject({
      code: CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      message: 'Create and connect only supports regular junction relations',
    });

    expect(commonApiContextBuilderService.build).not.toHaveBeenCalled();
    expect(
      workspaceOrmManager.runInWorkspaceTransaction,
    ).not.toHaveBeenCalled();
    expect(commonCreateOneQueryRunnerService.execute).not.toHaveBeenCalled();
  });

  it.each([
    {
      caseName: 'the morph group has only one member',
      flatObjects: [
        SOURCE_OBJECT,
        {
          ...JUNCTION_OBJECT,
          fieldIds: [JUNCTION_SOURCE_FIELD.id, JUNCTION_MORPH_TARGET_FIELD.id],
        },
        TARGET_OBJECT,
        OTHER_TARGET_OBJECT,
      ],
      targetFields: [JUNCTION_MORPH_TARGET_FIELD],
    },
    {
      caseName: 'another morph member target object cannot be resolved',
      flatObjects: [SOURCE_OBJECT, JUNCTION_OBJECT, TARGET_OBJECT],
      targetFields: [JUNCTION_MORPH_TARGET_FIELD, JUNCTION_MORPH_COMPANY_FIELD],
    },
  ])(
    'rejects a one-column morph junction when $caseName',
    async ({ flatObjects, targetFields }) => {
      setWorkspaceMetadata({ flatObjects, targetFields });

      await expect(execute()).rejects.toMatchObject({
        code: CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        message: 'Create and connect only supports regular junction relations',
      });

      expect(commonApiContextBuilderService.build).not.toHaveBeenCalled();
      expect(
        workspaceOrmManager.runInWorkspaceTransaction,
      ).not.toHaveBeenCalled();
      expect(commonCreateOneQueryRunnerService.execute).not.toHaveBeenCalled();
    },
  );

  it('rejects an invalid junction configuration before opening a transaction', async () => {
    setWorkspaceMetadata({
      sourceField: {
        ...SOURCE_JUNCTIONS_FIELD,
        settings: { relationType: RelationType.ONE_TO_MANY },
      },
    });

    await expect(execute()).rejects.toMatchObject({
      code: CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      message: 'Create and connect only supports regular junction relations',
    });

    expect(commonApiContextBuilderService.build).not.toHaveBeenCalled();
    expect(
      workspaceOrmManager.runInWorkspaceTransaction,
    ).not.toHaveBeenCalled();
    expect(commonCreateOneQueryRunnerService.execute).not.toHaveBeenCalled();
  });

  it('rejects an unknown relation field before opening a transaction', async () => {
    await expect(
      service.execute({
        input: {
          sourceRecordId: SOURCE_RECORD_ID,
          relationFieldMetadataId: 'unknown-field-id',
          targetRecordInput: { id: TARGET_RECORD_ID },
        },
        authContext,
      }),
    ).rejects.toMatchObject({
      code: CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      message: 'Relation field metadata not found',
    });

    expect(commonApiContextBuilderService.build).not.toHaveBeenCalled();
    expect(
      workspaceOrmManager.runInWorkspaceTransaction,
    ).not.toHaveBeenCalled();
    expect(commonCreateOneQueryRunnerService.execute).not.toHaveBeenCalled();
  });
});
