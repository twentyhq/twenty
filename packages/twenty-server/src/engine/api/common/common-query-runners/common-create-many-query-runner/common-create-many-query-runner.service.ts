import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FindOptionsRelations, In, InsertResult, ObjectLiteral } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
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
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { getAllSelectableColumnNames } from 'src/engine/api/utils/get-all-selectable-column-names.utils';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
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
      workspaceDataSource,
    } = queryRunnerContext;

    const objectRecords = await this.insertOrUpsertRecords({
      repository,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      args,
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
  }: {
    args: CommonExtendedInput<CreateManyQueryArgs>;
    records: ObjectRecord[];
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    authContext: AuthContext;
    workspaceDataSource: GlobalWorkspaceDataSource;
    rolePermissionConfig?: RolePermissionConfig;
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
    });
  }

  async computeArgs(
    args: CommonInput<CreateManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<CreateManyQueryArgs>> {
    const { authContext, flatObjectMetadata, flatFieldMetadataMaps } =
      queryRunnerContext;

    return {
      ...args,
      data: await this.dataArgProcessor.process({
        partialRecordInputs: args.data,
        authContext,
        flatObjectMetadata,
        flatFieldMetadataMaps,
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
    args,
  }: {
    repository: WorkspaceRepository<ObjectLiteral>;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    args: CommonExtendedInput<CreateManyQueryArgs>;
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

      return await repository.insert(args.data, undefined, selectedColumns);
    }

    return this.performUpsertOperation({
      repository,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      args,
      selectedFieldsResult,
    });
  }

  private async performUpsertOperation({
    repository,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    args,
    selectedFieldsResult,
  }: {
    repository: WorkspaceRepository<ObjectLiteral>;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    args: CreateManyQueryArgs;
    selectedFieldsResult: CommonSelectedFieldsResult;
  }): Promise<InsertResult> {
    const conflictingFields = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );
    const existingRecords = await this.findExistingRecords({
      repository,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      args,
      conflictingFields,
    });

    const { recordsToUpdate, recordsToInsert } = categorizeRecords(
      args.data,
      conflictingFields,
      existingRecords,
    );

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
      });
    }

    await this.processRecordsToInsert({
      recordsToInsert,
      repository,
      result,
      columnsToReturn,
    });

    return result;
  }

  private async findExistingRecords({
    repository,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    args,
    conflictingFields,
  }: {
    repository: WorkspaceRepository<ObjectLiteral>;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    args: CreateManyQueryArgs;
    conflictingFields: {
      baseField: string;
      fullPath: string;
      column: string;
    }[];
  }): Promise<PartialObjectRecordWithId[]> {
    const queryBuilder = repository.createQueryBuilder(
      flatObjectMetadata.nameSingular,
    );

    const whereConditions = buildWhereConditions(args.data, conflictingFields);

    whereConditions.forEach((condition) => {
      queryBuilder.orWhere(condition);
    });

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
  }: {
    partialRecordsToUpdate: PartialObjectRecordWithId[];
    repository: WorkspaceRepository<ObjectLiteral>;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    result: InsertResult;
    columnsToReturn: string[];
  }): Promise<void> {
    const partialRecordsToUpdateWithoutCreatedByUpdate =
      partialRecordsToUpdate.map((record) =>
        this.getRecordWithoutCreatedBy(
          record,
          flatObjectMetadata,
          flatFieldMetadataMaps,
        ),
      );

    const savedRecords = await repository.updateMany(
      partialRecordsToUpdateWithoutCreatedByUpdate.map((record) => ({
        criteria: record.id,
        partialEntity: { ...record, deletedAt: null },
      })),
      undefined,
      columnsToReturn,
    );

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
  }: {
    recordsToInsert: Partial<ObjectRecord>[];
    repository: WorkspaceRepository<ObjectLiteral>;
    result: InsertResult;
    columnsToReturn: string[];
  }): Promise<void> {
    if (recordsToInsert.length > 0) {
      const insertResult = await repository.insert(
        recordsToInsert,
        undefined,
        columnsToReturn,
      );

      result.identifiers.push(...insertResult.identifiers);
      result.generatedMaps.push(...insertResult.generatedMaps);
      result.raw.push(...insertResult.raw);
    }
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

    const upsertedRecords = await queryBuilder
      .setFindOptions({
        select: columnsToSelect,
      })
      .where({
        id: In(objectRecords.generatedMaps.map((record) => record.id)),
      })
      .withDeleted()
      .take(QUERY_MAX_RECORDS)
      .getMany();

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

    const createdByFieldMetadata =
      flatFieldMetadataMaps.byId[fieldIdByName['createdBy']];

    if (!isDefined(createdByFieldMetadata)) {
      throw new CommonQueryRunnerException(
        `Missing createdBy field metadata for object ${flatObjectMetadata.nameSingular}`,
        CommonQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    if ('createdBy' in record && createdByFieldMetadata.isCustom === false) {
      const { createdBy: _createdBy, ...recordWithoutCreatedBy } = record;

      recordWithoutCreatedByUpdate = recordWithoutCreatedBy;
    }

    return recordWithoutCreatedByUpdate;
  }
}
