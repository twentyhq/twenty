import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { capitalize, isDefined } from 'twenty-shared/utils';
import {
  In,
  type FindOperator,
  type InsertResult,
  type ObjectLiteral,
} from 'typeorm';

import {
  GraphqlQueryBaseResolverService,
  type GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { getAllSelectableFields } from 'src/engine/api/utils/get-all-selectable-fields.utils';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

type PartialObjectRecordWithId = Partial<ObjectRecord> & { id: string };
@Injectable()
export class GraphqlQueryCreateManyResolverService extends GraphqlQueryBaseResolverService<
  CreateManyResolverArgs,
  ObjectRecord[]
> {
  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>,
  ): Promise<ObjectRecord[]> {
    if (executionArgs.args.data.length > QUERY_MAX_RECORDS) {
      throw new GraphqlQueryRunnerException(
        `Maximum number of records to upsert is ${QUERY_MAX_RECORDS}.`,
        GraphqlQueryRunnerExceptionCode.UPSERT_MAX_RECORDS_EXCEEDED,
        {
          userFriendlyMessage: t`Maximum number of records to upsert is ${QUERY_MAX_RECORDS}.`,
        },
      );
    }

    const { objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      executionArgs.options;

    const { roleId } = executionArgs;

    const objectRecords = await this.insertOrUpsertRecords(executionArgs);

    const upsertedRecords = await this.fetchUpsertedRecords(
      executionArgs,
      objectRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    await this.processNestedRelationsIfNeeded({
      executionArgs,
      records: upsertedRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      roleId,
    });

    return this.formatRecordsForResponse(
      upsertedRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );
  }

  private async insertOrUpsertRecords(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>,
  ): Promise<InsertResult> {
    if (!executionArgs.args.upsert) {
      const { objectMetadataItemWithFieldMaps, objectMetadataMaps } =
        executionArgs.options;

      const selectedColumns = buildColumnsToReturn({
        select: executionArgs.graphqlQuerySelectedFieldsResult.select,
        relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      });

      return await executionArgs.repository.insert(
        executionArgs.args.data,
        undefined,
        selectedColumns,
      );
    }

    return this.performUpsertOperation(executionArgs);
  }

  private async performUpsertOperation(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>,
  ): Promise<InsertResult> {
    const { objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      executionArgs.options;

    const conflictingFields = this.getConflictingFields(
      objectMetadataItemWithFieldMaps,
    );
    const existingRecords = await this.findExistingRecords(
      executionArgs,
      conflictingFields,
    );

    const { recordsToUpdate, recordsToInsert } = this.categorizeRecords(
      executionArgs.args.data,
      conflictingFields,
      existingRecords,
    );

    const result: InsertResult = {
      identifiers: [],
      generatedMaps: [],
      raw: [],
    };

    const columnsToReturn = buildColumnsToReturn({
      select: executionArgs.graphqlQuerySelectedFieldsResult.select,
      relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    if (recordsToUpdate.length > 0) {
      await this.processRecordsToUpdate({
        partialRecordsToUpdate: recordsToUpdate,
        repository: executionArgs.repository,
        objectMetadataItemWithFieldMaps,
        result,
        columnsToReturn,
      });
    }

    await this.processRecordsToInsert({
      recordsToInsert,
      repository: executionArgs.repository,
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

  private async findExistingRecords(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>,
    conflictingFields: {
      baseField: string;
      fullPath: string;
      column: string;
    }[],
  ): Promise<PartialObjectRecordWithId[]> {
    const { objectMetadataItemWithFieldMaps } = executionArgs.options;
    const queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const whereConditions = this.buildWhereConditions(
      executionArgs.args.data,
      conflictingFields,
    );

    whereConditions.forEach((condition) => {
      queryBuilder.orWhere(condition);
    });

    const restrictedFields =
      executionArgs.repository.objectRecordsPermissions?.[
        objectMetadataItemWithFieldMaps.id
      ]?.restrictedFields;

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

      throw new GraphqlQueryRunnerException(
        `Multiple records found with the same unique field values for ${conflictingFieldsValues}. Cannot determine which record to update.`,
        GraphqlQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT,
        {
          userFriendlyMessage: t`Multiple records found with the same unique field values for ${conflictingFieldsValues}. Cannot determine which record to update.`,
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

  private async fetchUpsertedRecords(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>,
    objectRecords: InsertResult,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
  ): Promise<ObjectRecord[]> {
    const queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const columnsToSelect = buildColumnsToSelect({
      select: executionArgs.graphqlQuerySelectedFieldsResult.select,
      relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
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
    executionArgs,
    records,
    objectMetadataItemWithFieldMaps,
    objectMetadataMaps,
    roleId,
  }: {
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>;
    records: ObjectRecord[];
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
    roleId?: string;
  }): Promise<void> {
    if (!executionArgs.graphqlQuerySelectedFieldsResult.relations) {
      return;
    }

    await this.processNestedRelationsHelper.processNestedRelations({
      objectMetadataMaps,
      parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
      parentObjectRecords: records,
      relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
      limit: QUERY_MAX_RECORDS,
      authContext: executionArgs.options.authContext,
      workspaceDataSource: executionArgs.workspaceDataSource,
      roleId,
      shouldBypassPermissionChecks: executionArgs.shouldBypassPermissionChecks,
      selectedFields: executionArgs.graphqlQuerySelectedFieldsResult.select,
    });
  }

  private formatRecordsForResponse(
    upsertedRecords: ObjectRecord[],
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
  ): ObjectRecord[] {
    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    return upsertedRecords.map((record: ObjectRecord) =>
      typeORMObjectRecordsParser.processRecord({
        objectRecord: record,
        objectName: objectMetadataItemWithFieldMaps.nameSingular,
        take: 1,
        totalCount: 1,
      }),
    );
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
      throw new GraphqlQueryRunnerException(
        `Missing createdBy field metadata for object ${objectMetadataItemWithFieldMaps.nameSingular}`,
        GraphqlQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD,
      );
    }

    if ('createdBy' in record && createdByFieldMetadata.isCustom === false) {
      const { createdBy: _createdBy, ...recordWithoutCreatedBy } = record;

      recordWithoutCreatedByUpdate = recordWithoutCreatedBy;
    }

    return recordWithoutCreatedByUpdate;
  }

  async validate<T extends ObjectRecord>(
    args: CreateManyResolverArgs<Partial<T>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    assertMutationNotOnRemoteObject(options.objectMetadataItemWithFieldMaps);

    args.data.forEach((record) => {
      if (record?.id) {
        assertIsValidUuid(record.id);
      }
    });
  }
}
