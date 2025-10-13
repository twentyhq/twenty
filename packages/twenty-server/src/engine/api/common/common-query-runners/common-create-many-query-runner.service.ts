import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { capitalize, isDefined } from 'twenty-shared/utils';
import {
  FindOperator,
  FindOptionsRelations,
  In,
  InsertResult,
  ObjectLiteral,
} from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
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
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

type PartialObjectRecordWithId = Partial<ObjectRecord> & { id: string };

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
    const conflictingFields = this.getConflictingFields(
      objectMetadataItemWithFieldMaps,
    );
    const existingRecords = await this.findExistingRecords({
      repository,
      objectMetadataItemWithFieldMaps,
      args,
      conflictingFields,
    });

    const { recordsToUpdate, recordsToInsert } = this.categorizeRecords(
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

  //TODO : Improve conflicting fields logic - unicity can be define on combination of fields - should be based on unique index not on field metadata
  //TODO : https://github.com/twentyhq/core-team-issues/issues/1115
  private getConflictingFields(
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ): {
    baseField: string;
    fullPath: string;
    column: string;
  }[] {
    return Object.values(objectMetadataItemWithFieldMaps.fieldsById)
      .filter((field) => field.isUnique || field.name === 'id')
      .flatMap((field) => {
        const compositeType = compositeTypeDefinitions.get(field.type);

        if (!compositeType) {
          return [
            {
              baseField: field.name,
              fullPath: field.name,
              column: field.name,
            },
          ];
        }

        const property = compositeType.properties.find(
          (prop) => prop.isIncludedInUniqueConstraint,
        );

        return property
          ? [
              {
                baseField: field.name,
                fullPath: `${field.name}.${property.name}`,
                column: `${field.name}${capitalize(property.name)}`,
              },
            ]
          : [];
      });
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

    const whereConditions = this.buildWhereConditions(
      args.data,
      conflictingFields,
    );

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

  private getValueFromPath(
    record: Partial<ObjectRecord>,
    path: string,
  ): unknown {
    const pathParts = path.split('.');

    if (pathParts.length === 1) {
      return record[path];
    }

    const [parentField, childField] = pathParts;

    return record[parentField]?.[childField];
  }

  private buildWhereConditions(
    records: Partial<ObjectRecord>[],
    conflictingFields: {
      baseField: string;
      fullPath: string;
      column: string;
    }[],
  ): Record<string, FindOperator<string>>[] {
    const whereConditions = [];

    for (const field of conflictingFields) {
      const fieldValues = records
        .map((record) => this.getValueFromPath(record, field.fullPath))
        .filter(Boolean);

      //TODO : Adapt to composite constraint - https://github.com/twentyhq/core-team-issues/issues/1115
      if (fieldValues.length > 0) {
        whereConditions.push({ [field.column]: In(fieldValues) });
      }
    }

    return whereConditions;
  }

  private categorizeRecords(
    records: Partial<ObjectRecord>[],
    conflictingFields: {
      baseField: string;
      fullPath: string;
      column: string;
    }[],
    existingRecords: PartialObjectRecordWithId[],
  ): {
    recordsToUpdate: PartialObjectRecordWithId[];
    recordsToInsert: Partial<ObjectRecord>[];
  } {
    const recordsToUpdate: PartialObjectRecordWithId[] = [];
    const recordsToInsert: Partial<ObjectRecord>[] = [];

    for (const record of records) {
      const matchingRecordId = this.getMatchingRecordId(
        record,
        conflictingFields,
        existingRecords,
      );

      if (isDefined(matchingRecordId)) {
        recordsToUpdate.push({ ...record, id: matchingRecordId });
      } else {
        recordsToInsert.push(record);
      }
    }

    return { recordsToUpdate, recordsToInsert };
  }

  private getMatchingRecordId(
    record: Partial<ObjectRecord>,
    conflictingFields: {
      baseField: string;
      fullPath: string;
      column: string;
    }[],
    existingRecords: PartialObjectRecordWithId[],
  ): string | undefined {
    const matchingRecordIds = conflictingFields.reduce<string[]>(
      (acc, field) => {
        const requestFieldValue = this.getValueFromPath(record, field.fullPath);

        const matchingRecord = existingRecords.find((existingRecord) => {
          const existingFieldValue = this.getValueFromPath(
            existingRecord,
            field.fullPath,
          );

          return (
            isDefined(existingFieldValue) &&
            existingFieldValue === requestFieldValue
          );
        });

        if (isDefined(matchingRecord)) {
          acc.push(matchingRecord.id);
        }

        return acc;
      },
      [],
    );

    if ([...new Set(matchingRecordIds)].length > 1) {
      const conflictingFieldsValues = conflictingFields
        .map((field) => {
          const value = this.getValueFromPath(record, field.fullPath);

          return isDefined(value) ? `${field.fullPath}: ${value}` : undefined;
        })
        .filter(isDefined)
        .join(', ');

      throw new CommonQueryRunnerException(
        `Multiple records found with the same unique field values for ${conflictingFieldsValues}. Cannot determine which record to update.`,
        CommonQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT,
        {
          userFriendlyMessage: msg`Multiple records found with the same unique field values for ${conflictingFieldsValues}. Cannot determine which record to update.`,
        },
      );
    }

    return matchingRecordIds[0];
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
