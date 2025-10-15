import { Injectable } from '@nestjs/common';

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
import {
  CommonQueryNames,
  CreateManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { isWorkspaceAuthContext } from 'src/engine/api/common/utils/is-workspace-auth-context.util';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { getAllSelectableFields } from 'src/engine/api/utils/get-all-selectable-fields.utils';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

@Injectable()
export class CommonCreateManyQueryRunnerService extends CommonBaseQueryRunnerService {
  async run({
    args,
    authContext: toValidateAuthContext,
    objectMetadataMaps,
    objectMetadataItemWithFieldMaps,
  }: {
    args: CreateManyQueryArgs;
    authContext: AuthContext;
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<ObjectRecord[]> {
    const authContext = toValidateAuthContext;

    if (!isWorkspaceAuthContext(authContext)) {
      throw new CommonQueryRunnerException(
        'Invalid auth context',
        CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT,
      );
    }
    assertMutationNotOnRemoteObject(objectMetadataItemWithFieldMaps);

    // TODO : Refacto-common - Remove this validation once https://github.com/twentyhq/core-team-issues/issues/1622 done
    args.data.forEach((record) => {
      if (record?.id) {
        assertIsValidUuid(record.id);
      }
    });

    const {
      workspaceDataSource,
      repository,
      roleId,
      shouldBypassPermissionChecks,
    } = await this.prepareQueryRunnerContext({
      authContext,
      objectMetadataItemWithFieldMaps,
    });

    const processedArgs = await this.processQueryArgs({
      authContext,
      objectMetadataItemWithFieldMaps,
      args,
    });

    const objectRecords = await this.insertOrUpsertRecords({
      repository,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      args: processedArgs,
    });

    const upsertedRecords = await this.fetchUpsertedRecords({
      args: processedArgs,
      objectRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      repository,
    });

    await this.processNestedRelationsIfNeeded({
      args: processedArgs,
      records: upsertedRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      roleId,
      authContext,
      workspaceDataSource,
      shouldBypassPermissionChecks,
    });

    return upsertedRecords;
  }

  async processQueryArgs({
    authContext,
    objectMetadataItemWithFieldMaps,
    args,
  }: {
    authContext: WorkspaceAuthContext;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    args: CreateManyQueryArgs;
  }): Promise<CreateManyQueryArgs> {
    const hookedArgs =
      (await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItemWithFieldMaps.nameSingular,
        CommonQueryNames.createMany,
        args,
        //TODO : Refacto-common - To fix when updating workspaceQueryHookService, removing gql typing dependency
      )) as CreateManyQueryArgs;

    return {
      ...hookedArgs,
      data: await this.queryRunnerArgsFactory.overrideDataByFieldMetadata({
        partialRecordInputs: hookedArgs.data,
        authContext,
        objectMetadataItemWithFieldMaps,
      }),
    };
  }

  private async insertOrUpsertRecords({
    repository,
    objectMetadataItemWithFieldMaps,
    objectMetadataMaps,
    args,
  }: {
    repository: WorkspaceRepository<ObjectLiteral>;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
    args: CreateManyQueryArgs;
  }): Promise<InsertResult> {
    if (!args.upsert) {
      const selectedColumns = buildColumnsToReturn({
        select: args.selectedFieldsResult.select,
        relations: args.selectedFieldsResult.relations,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      });

      return await repository.insert(args.data, undefined, selectedColumns);
    }

    return this.performUpsertOperation({
      repository,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      args,
    });
  }

  private async performUpsertOperation({
    repository,
    objectMetadataItemWithFieldMaps,
    objectMetadataMaps,
    args,
  }: {
    repository: WorkspaceRepository<ObjectLiteral>;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
    args: CreateManyQueryArgs;
  }): Promise<InsertResult> {
    const conflictingFields = getConflictingFields(
      objectMetadataItemWithFieldMaps,
    );
    const existingRecords = await this.findExistingRecords({
      repository,
      objectMetadataItemWithFieldMaps,
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
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    if (recordsToUpdate.length > 0) {
      await this.processRecordsToUpdate({
        partialRecordsToUpdate: recordsToUpdate,
        repository,
        objectMetadataItemWithFieldMaps,
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
    objectMetadataItemWithFieldMaps,
    args,
    conflictingFields,
  }: {
    repository: WorkspaceRepository<ObjectLiteral>;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    args: CreateManyQueryArgs;
    conflictingFields: {
      baseField: string;
      fullPath: string;
      column: string;
    }[];
  }): Promise<PartialObjectRecordWithId[]> {
    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const whereConditions = buildWhereConditions(args.data, conflictingFields);

    whereConditions.forEach((condition) => {
      queryBuilder.orWhere(condition);
    });

    const restrictedFields =
      repository.objectRecordsPermissions?.[objectMetadataItemWithFieldMaps.id]
        ?.restrictedFields;

    const selectOptions = getAllSelectableFields({
      restrictedFields: restrictedFields ?? {},
      objectMetadata: {
        objectMetadataMapItem: objectMetadataItemWithFieldMaps,
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
    objectMetadataItemWithFieldMaps,
    result,
    columnsToReturn,
  }: {
    partialRecordsToUpdate: PartialObjectRecordWithId[];
    repository: WorkspaceRepository<ObjectLiteral>;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    result: InsertResult;
    columnsToReturn: string[];
  }): Promise<void> {
    const partialRecordsToUpdateWithoutCreatedByUpdate =
      partialRecordsToUpdate.map((record) =>
        this.getRecordWithoutCreatedBy(record, objectMetadataItemWithFieldMaps),
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
    args,
    objectRecords,
    objectMetadataItemWithFieldMaps,
    objectMetadataMaps,
    repository,
  }: {
    args: CreateManyQueryArgs;
    objectRecords: InsertResult;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
    repository: WorkspaceRepository<ObjectLiteral>;
  }): Promise<ObjectRecord[]> {
    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const columnsToSelect = buildColumnsToSelect({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
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

  private async processNestedRelationsIfNeeded({
    args,
    records,
    objectMetadataItemWithFieldMaps,
    objectMetadataMaps,
    roleId,
    authContext,
    workspaceDataSource,
    shouldBypassPermissionChecks,
  }: {
    args: CreateManyQueryArgs;
    records: ObjectRecord[];
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
    roleId?: string;
    authContext: AuthContext;
    workspaceDataSource: WorkspaceDataSource;
    shouldBypassPermissionChecks: boolean;
  }): Promise<void> {
    if (!args.selectedFieldsResult.relations) {
      return;
    }

    await this.processNestedRelationsHelper.processNestedRelations({
      objectMetadataMaps,
      parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
      parentObjectRecords: records,
      //TODO : Refacto-common - Typing to fix when switching processNestedRelationsHelper to Common
      relations: args.selectedFieldsResult.relations as Record<
        string,
        FindOptionsRelations<ObjectLiteral>
      >,
      limit: QUERY_MAX_RECORDS,
      authContext,
      workspaceDataSource,
      roleId,
      shouldBypassPermissionChecks,
      selectedFields: args.selectedFieldsResult.select,
    });
  }

  private getRecordWithoutCreatedBy(
    record: PartialObjectRecordWithId,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ): Omit<PartialObjectRecordWithId, 'createdBy'> {
    let recordWithoutCreatedByUpdate = record;

    const createdByFieldMetadataId =
      objectMetadataItemWithFieldMaps.fieldIdByName['createdBy'];
    const createdByFieldMetadata =
      objectMetadataItemWithFieldMaps.fieldsById[createdByFieldMetadataId];

    if (!isDefined(createdByFieldMetadata)) {
      throw new CommonQueryRunnerException(
        `Missing createdBy field metadata for object ${objectMetadataItemWithFieldMaps.nameSingular}`,
        CommonQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD,
      );
    }

    if ('createdBy' in record && createdByFieldMetadata.isCustom === false) {
      const { createdBy: _createdBy, ...recordWithoutCreatedBy } = record;

      recordWithoutCreatedByUpdate = recordWithoutCreatedBy;
    }

    return recordWithoutCreatedByUpdate;
  }
}
