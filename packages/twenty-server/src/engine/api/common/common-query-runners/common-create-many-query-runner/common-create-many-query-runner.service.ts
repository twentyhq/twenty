import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { FeatureFlagKey, ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  Brackets,
  FindOptionsRelations,
  In,
  InsertResult,
  ObjectLiteral,
} from 'typeorm';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { type ConflictingFieldGroup } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/conflicting-field-group.type';
import { PartialObjectRecordWithId } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/partial-object-record-with-id.type';
import { buildWhereConditions } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/build-where-conditions.util';
import { categorizeRecords } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/categorize-records.util';
import { getConflictingFields } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-conflicting-fields.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  CreateManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type NestedRelationsReadPathOptions } from 'src/engine/api/common/types/nested-relations-read-path-options.type';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { getAllSelectableColumnNames } from 'src/engine/api/utils/get-all-selectable-column-names.utils';
import { WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

@Injectable()
export class CommonCreateManyQueryRunnerService extends CommonBaseQueryRunnerService<
  CreateManyQueryArgs,
  ObjectRecord[]
> {
  protected readonly operationName = CommonQueryNames.CREATE_MANY;

  constructor(private readonly recordPositionService: RecordPositionService) {
    super();
  }

  async run(
    args: CommonExtendedInput<CreateManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord[]> {
    if (args.data.length > QUERY_MAX_RECORDS) {
      throw new CommonQueryRunnerException(
        `Maximum number of records to upsert is ${QUERY_MAX_RECORDS}.`,
        CommonQueryRunnerExceptionCode.TOO_MANY_RECORDS_TO_UPDATE,
        {
          userFriendlyMessage: msg`Maximum number of records to upsert is ${QUERY_MAX_RECORDS}.`,
        },
      );
    }

    const {
      repository,
      authContext,
      rolePermissionConfig,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      workspaceDataSource,
    } = queryRunnerContext;

    if (!isDefined(flatIndexMaps)) {
      throw new CommonQueryRunnerException(
        `Missing flatIndexMaps in queryRunnerContext`,
        CommonQueryRunnerExceptionCode.MISSING_FLAT_INDEX_MAPS,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const objectRecords = await this.insertOrUpsertRecords({
      repository,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      args,
      workspaceId: authContext.workspace.id,
      queryRunnerContext,
    });

    const upsertedRecords = await this.fetchUpsertedRecords({
      objectRecords,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      repository,
      selectedFieldsResult: args.selectedFieldsResult,
    });

    await this.processNestedRelationsIfNeeded({
      args,
      records: upsertedRecords,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      authContext,
      workspaceDataSource,
      rolePermissionConfig,
      nestedRelationsReadPathOptions:
        this.getNestedRelationsReadPathOptions(queryRunnerContext),
    });

    return upsertedRecords;
  }

  private async processNestedRelationsIfNeeded({
    args,
    records,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    authContext,
    workspaceDataSource,
    rolePermissionConfig,
    nestedRelationsReadPathOptions,
  }: {
    args: CommonExtendedInput<CreateManyQueryArgs>;
    records: ObjectRecord[];
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    authContext: WorkspaceAuthContext;
    workspaceDataSource: GlobalWorkspaceDataSource;
    rolePermissionConfig?: RolePermissionConfig;
    nestedRelationsReadPathOptions: NestedRelationsReadPathOptions;
  }): Promise<void> {
    if (!args.selectedFieldsResult.relations) {
      return;
    }

    await this.processNestedRelationsHelper.processNestedRelations({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      parentObjectMetadataItem: flatObjectMetadata,
      parentObjectRecords: records,
      relations: args.selectedFieldsResult.relations as Record<
        string,
        FindOptionsRelations<ObjectLiteral>
      >,
      limit: QUERY_MAX_RECORDS,
      authContext,
      workspaceDataSource,
      rolePermissionConfig,
      selectedFields: args.selectedFieldsResult.select,
      ...nestedRelationsReadPathOptions,
    });
  }

  async computeArgs(
    args: CommonInput<CreateManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<CreateManyQueryArgs>> {
    const {
      authContext,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    } = queryRunnerContext;

    return {
      ...args,
      data: await this.dataArgProcessor.process({
        partialRecordInputs: args.data,
        authContext,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        shouldBackfillPositionIfUndefined: !args.upsert,
      }),
    };
  }

  async validate(
    args: CommonInput<CreateManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    const { flatObjectMetadata } = queryRunnerContext;

    assertMutationNotOnRemoteObject(flatObjectMetadata);

    args.data.forEach((record) => {
      if (record?.id) {
        assertIsValidUuid(record.id);
      }
    });
  }

  private async insertOrUpsertRecords({
    repository,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatIndexMaps,
    args,
    workspaceId,
    queryRunnerContext,
  }: {
    repository: WorkspaceRepository<ObjectLiteral>;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
    args: CommonExtendedInput<CreateManyQueryArgs>;
    workspaceId: string;
    queryRunnerContext: CommonExtendedQueryRunnerContext;
  }): Promise<InsertResult> {
    const { selectedFieldsResult } = args;

    if (!args.upsert) {
      const selectedColumns = buildColumnsToReturn({
        select: selectedFieldsResult.select,
        relations: selectedFieldsResult.relations,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      const ormV2CanHandle =
        queryRunnerContext.featureFlagsMap[
          FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED
        ];

      if (ormV2CanHandle) {
        const writeRepository = this.getWriteRepository(queryRunnerContext);

        return writeRepository.runInsert({
          records: await this.resolveNestedRelationsForOrmV2({
            records: args.data,
            queryRunnerContext,
            writeRepository,
          }),
          columnsToReturn: selectedColumns,
        });
      }

      return await repository.insert(args.data, undefined, selectedColumns);
    }

    return this.performUpsertOperation({
      repository,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      args,
      selectedFieldsResult,
      workspaceId,
      queryRunnerContext,
    });
  }

  private async performUpsertOperation({
    repository,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatIndexMaps,
    args,
    selectedFieldsResult,
    workspaceId,
    queryRunnerContext,
  }: {
    repository: WorkspaceRepository<ObjectLiteral>;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
    args: CreateManyQueryArgs;
    selectedFieldsResult: CommonSelectedFieldsResult;
    workspaceId: string;
    queryRunnerContext: CommonExtendedQueryRunnerContext;
  }): Promise<InsertResult> {
    const conflictingFieldGroups = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatIndexMaps,
    );
    const existingRecords = await this.findExistingRecords({
      repository,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      args,
      conflictingFieldGroups,
      isOrmV2Enabled:
        queryRunnerContext.featureFlagsMap[
          FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED
        ],
    });

    const { recordsToUpdate, recordsToInsert } = categorizeRecords(
      args.data,
      conflictingFieldGroups,
      existingRecords,
    );

    const recordsToInsertWithPosition = await this.backfillPositionForInserts({
      recordsToInsert,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      workspaceId,
    });

    const result: InsertResult = {
      identifiers: [],
      generatedMaps: [],
      raw: [],
    };

    const columnsToReturn = buildColumnsToReturn({
      select: selectedFieldsResult.select,
      relations: selectedFieldsResult.relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (recordsToUpdate.length > 0) {
      await this.processRecordsToUpdate({
        partialRecordsToUpdate: recordsToUpdate,
        repository,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        result,
        columnsToReturn,
        queryRunnerContext,
      });
    }

    await this.processRecordsToInsert({
      recordsToInsert: recordsToInsertWithPosition,
      repository,
      result,
      columnsToReturn,
      queryRunnerContext,
    });

    return result;
  }

  private async backfillPositionForInserts({
    recordsToInsert,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    workspaceId,
  }: {
    recordsToInsert: Partial<ObjectRecord>[];
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    workspaceId: string;
  }): Promise<Partial<ObjectRecord>[]> {
    if (recordsToInsert.length === 0) {
      return recordsToInsert;
    }

    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    return this.recordPositionService.overridePositionOnRecords({
      partialRecordInputs: recordsToInsert,
      workspaceId,
      objectMetadata: {
        isCustom: flatObjectMetadata.isCustom ?? false,
        nameSingular: flatObjectMetadata.nameSingular,
        fieldIdByName,
      },
      shouldBackfillPositionIfUndefined: true,
    });
  }

  private async findExistingRecords({
    repository,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    args,
    conflictingFieldGroups,
    isOrmV2Enabled,
  }: {
    repository: WorkspaceRepository<ObjectLiteral>;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    args: CreateManyQueryArgs;
    conflictingFieldGroups: ConflictingFieldGroup[];
    isOrmV2Enabled: boolean;
  }): Promise<PartialObjectRecordWithId[]> {
    const queryBuilder = repository.createQueryBuilder(
      flatObjectMetadata.nameSingular,
    );

    const whereConditions = buildWhereConditions(
      args.data,
      conflictingFieldGroups,
    );

    if (whereConditions.length === 0) {
      return [];
    }

    if (isOrmV2Enabled) {
      // Group the OR conditions so the v2 row-level-permission predicate, which
      // is ANDed onto the query, applies to the whole disjunction rather than
      // only the first branch.
      queryBuilder.andWhere(
        new Brackets((qb) => {
          whereConditions.forEach((condition, index) => {
            if (index === 0) {
              qb.where(condition);
            } else {
              qb.orWhere(condition);
            }
          });
        }),
      );
    } else {
      whereConditions.forEach((condition) => {
        queryBuilder.orWhere(condition);
      });
    }

    const restrictedFields =
      repository.objectRecordsPermissions?.[flatObjectMetadata.id]
        ?.restrictedFields;

    const selectOptions = getAllSelectableColumnNames({
      restrictedFields: restrictedFields ?? {},
      objectMetadata: {
        objectMetadataMapItem: flatObjectMetadata,
        flatFieldMetadataMaps,
      },
    });

    return (await queryBuilder
      .withDeleted()
      .setFindOptions({
        select: selectOptions,
      })
      .getMany()) as PartialObjectRecordWithId[];
  }

  private async processRecordsToUpdate({
    partialRecordsToUpdate,
    repository,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    result,
    columnsToReturn,
    queryRunnerContext,
  }: {
    partialRecordsToUpdate: PartialObjectRecordWithId[];
    repository: WorkspaceRepository<ObjectLiteral>;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    result: InsertResult;
    columnsToReturn: string[];
    queryRunnerContext: CommonExtendedQueryRunnerContext;
  }): Promise<void> {
    const updateInputs = partialRecordsToUpdate
      .map((record) =>
        this.getRecordWithoutCreatedBy(
          record,
          flatObjectMetadata,
          flatFieldMetadataMaps,
        ),
      )
      .map((record) => ({
        id: record.id,
        data: { ...record, deletedAt: null },
      }));

    const ormV2CanHandle =
      queryRunnerContext.featureFlagsMap[
        FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED
      ];

    let savedRecords;

    if (ormV2CanHandle) {
      const writeRepository = this.getWriteRepository(queryRunnerContext);
      const resolvedData = await this.resolveNestedRelationsForOrmV2({
        records: updateInputs.map((input) => input.data),
        queryRunnerContext,
        writeRepository,
      });

      savedRecords = await writeRepository.runBatchUpdate({
        inputs: updateInputs.map((input, index) => ({
          id: input.id,
          data: resolvedData[index],
        })),
        columnsToReturn,
      });
    } else {
      savedRecords = await repository.updateMany(
        updateInputs.map((input) => ({
          criteria: input.id,
          partialEntity: input.data,
        })),
        undefined,
        columnsToReturn,
      );
    }

    result.identifiers.push(
      ...savedRecords.generatedMaps.map((record) => ({ id: record.id })),
    );
    result.generatedMaps.push(
      ...savedRecords.generatedMaps.map((record) => ({ id: record.id })),
    );
  }

  private async processRecordsToInsert({
    recordsToInsert,
    repository,
    result,
    columnsToReturn,
    queryRunnerContext,
  }: {
    recordsToInsert: Partial<ObjectRecord>[];
    repository: WorkspaceRepository<ObjectLiteral>;
    result: InsertResult;
    columnsToReturn: string[];
    queryRunnerContext: CommonExtendedQueryRunnerContext;
  }): Promise<void> {
    if (recordsToInsert.length === 0) {
      return;
    }

    const ormV2CanHandle =
      queryRunnerContext.featureFlagsMap[
        FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED
      ];

    let insertResult;

    if (ormV2CanHandle) {
      const writeRepository = this.getWriteRepository(queryRunnerContext);

      insertResult = await writeRepository.runInsert({
        records: await this.resolveNestedRelationsForOrmV2({
          records: recordsToInsert,
          queryRunnerContext,
          writeRepository,
        }),
        columnsToReturn,
      });
    } else {
      insertResult = await repository.insert(
        recordsToInsert,
        undefined,
        columnsToReturn,
      );
    }

    result.identifiers.push(...insertResult.identifiers);
    result.generatedMaps.push(...insertResult.generatedMaps);
    result.raw.push(...insertResult.raw);
  }

  private async fetchUpsertedRecords({
    objectRecords,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    repository,
    selectedFieldsResult,
  }: {
    objectRecords: InsertResult;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    repository: WorkspaceRepository<ObjectLiteral>;
    selectedFieldsResult: CommonSelectedFieldsResult;
  }): Promise<ObjectRecord[]> {
    const queryBuilder = repository.createQueryBuilder(
      flatObjectMetadata.nameSingular,
    );

    const columnsToSelect = buildColumnsToSelect({
      select: selectedFieldsResult.select,
      relations: selectedFieldsResult.relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const orderedIds = objectRecords.generatedMaps.map((record) => record.id);

    const upsertedRecords = await queryBuilder
      .setFindOptions({
        select: columnsToSelect,
      })
      .where({
        id: In(orderedIds),
      })
      .withDeleted()
      .take(QUERY_MAX_RECORDS)
      .getMany();

    const orderIndex = new Map(orderedIds.map((id, index) => [id, index]));

    upsertedRecords.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    return upsertedRecords as ObjectRecord[];
  }

  async processQueryResult(
    queryResult: ObjectRecord[],
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    authContext: WorkspaceAuthContext,
  ): Promise<ObjectRecord[]> {
    return await this.commonResultGettersService.processRecordArray(
      queryResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      authContext.workspace.id,
    );
  }

  private getRecordWithoutCreatedBy(
    record: PartialObjectRecordWithId,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): Omit<PartialObjectRecordWithId, 'createdBy'> {
    let recordWithoutCreatedByUpdate = record;

    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    const createdByFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldIdByName['createdBy'],
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(createdByFieldMetadata)) {
      throw new CommonQueryRunnerException(
        `Missing createdBy field metadata for object ${flatObjectMetadata.nameSingular}`,
        CommonQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    if ('createdBy' in record && createdByFieldMetadata.isSystem === true) {
      const { createdBy: _createdBy, ...recordWithoutCreatedBy } = record;

      recordWithoutCreatedByUpdate = recordWithoutCreatedBy;
    }

    return recordWithoutCreatedByUpdate;
  }
}
