import { Injectable } from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import {
  QUERY_MAX_RECORDS,
  QUERY_MAX_RECORDS_FROM_RELATION,
} from 'twenty-shared/constants';
import { ObjectRecord, OrderByDirection } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FindOptionsRelations, In, ObjectLiteral } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { CommonFindDuplicatesOutputItem } from 'src/engine/api/common/types/common-find-duplicates-output-item.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  FindDuplicatesQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { getPageInfo } from 'src/engine/api/common/utils/get-page-info.util';
import { settings } from 'src/engine/constants/settings';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import {
  buildDuplicateConditions,
  calculateNormalizedStringSimilarity,
} from 'src/engine/api/utils/build-duplicate-conditions.utils';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getCompositeFieldMetadataMap } from 'src/engine/twenty-orm/utils/format-result.util';

@Injectable()
export class CommonFindDuplicatesQueryRunnerService extends CommonBaseQueryRunnerService<
  FindDuplicatesQueryArgs,
  CommonFindDuplicatesOutputItem[]
> {
  protected readonly operationName = CommonQueryNames.FIND_DUPLICATES;

  async run(
    args: CommonExtendedInput<FindDuplicatesQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonFindDuplicatesOutputItem[]> {
    const {
      repository,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      commonQueryParser,
      authContext,
      workspaceDataSource,
      rolePermissionConfig,
    } = queryRunnerContext;

    const existingRecordsQueryBuilder = repository.createQueryBuilder(
      flatObjectMetadata.nameSingular,
    );

    let objectRecords: Partial<ObjectRecord>[] = [];

    const columnsToSelect = buildColumnsToSelect({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
    const duplicateLookupColumns = this.buildDuplicateLookupColumns(
      columnsToSelect,
      flatObjectMetadata,
    );

    if (isDefined(args.ids) && args.ids.length > 0) {
      const fetchedRecords = (await existingRecordsQueryBuilder
        .where({ id: In(args.ids) })
        .setFindOptions({
          select: duplicateLookupColumns,
        })
        .getMany()) as ObjectRecord[];

      const orderIndex = new Map(args.ids.map((id, index) => [id, index]));

      fetchedRecords.sort(
        (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
      );

      objectRecords = fetchedRecords;
    } else if (args.data && !isEmpty(args.data)) {
      objectRecords = this.normalizeRecordsForDuplicateLookup(
        args.data,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      );
    }

    const findDuplicatesOutput: CommonFindDuplicatesOutputItem[] =
      await Promise.all(
        objectRecords.map(async (record) => {
          const duplicateConditions = buildDuplicateConditions(
            flatObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            [record],
            record.id,
          );

          if (isEmpty(duplicateConditions)) {
            return {
              records: [],
              totalCount: 0,
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            };
          }

          const duplicateRecordsQueryBuilder = repository.createQueryBuilder(
            flatObjectMetadata.nameSingular,
          );

          commonQueryParser.applyFilterToBuilder(
            duplicateRecordsQueryBuilder,
            flatObjectMetadata.nameSingular,
            duplicateConditions,
          );

          const shouldApplyFuzzyCompanyNameMatching =
            this.shouldApplyFuzzyCompanyNameMatching(record, flatObjectMetadata);

          let duplicates: ObjectRecord[];
          let totalCount: number;

          if (shouldApplyFuzzyCompanyNameMatching) {
            const duplicateCandidates = (await duplicateRecordsQueryBuilder
              .setFindOptions({
                select: duplicateLookupColumns,
              })
              .getMany()) as ObjectRecord[];

            const filteredDuplicates =
              this.filterDuplicateCandidatesByCriteria(
                duplicateCandidates,
                record,
                flatObjectMetadata,
                flatFieldMetadataMaps,
              );

            totalCount = filteredDuplicates.length;
            duplicates = filteredDuplicates.slice(0, QUERY_MAX_RECORDS);
          } else {
            duplicates = (await duplicateRecordsQueryBuilder
              .setFindOptions({
                select: duplicateLookupColumns,
              })
              .take(QUERY_MAX_RECORDS)
              .getMany()) as ObjectRecord[];

            const aggregateQueryBuilder = duplicateRecordsQueryBuilder.clone();
            totalCount = await aggregateQueryBuilder.getCount();
          }

          const projectedDuplicates = duplicates.map((duplicateRecord) =>
            this.projectDuplicateRecord(duplicateRecord, columnsToSelect),
          );

          const { startCursor, endCursor } = getPageInfo(
            projectedDuplicates,
            [{ id: OrderByDirection.AscNullsFirst }],
            QUERY_MAX_RECORDS,
            true,
          );

          return {
            records: projectedDuplicates,
            totalCount,
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor,
            endCursor,
          };
        }),
      );

    if (isDefined(args.selectedFieldsResult.relations)) {
      await this.processNestedRelationsHelper.processNestedRelations({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        parentObjectMetadataItem: flatObjectMetadata,
        parentObjectRecords: findDuplicatesOutput.flatMap(
          (item) => item.records,
        ),
        parentObjectRecordsAggregatedValues: {},
        relations: args.selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        limit: QUERY_MAX_RECORDS_FROM_RELATION,
        authContext,
        workspaceDataSource,
        rolePermissionConfig,
        selectedFields: args.selectedFieldsResult.select,
      });
    }

    return findDuplicatesOutput;
  }

  async computeArgs(
    args: CommonInput<FindDuplicatesQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<FindDuplicatesQueryArgs>> {
    const { authContext, flatObjectMetadata, flatFieldMetadataMaps } =
      queryRunnerContext;

    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    return {
      ...args,
      ids: await Promise.all(
        args.ids?.map((id) =>
          this.queryRunnerArgsFactory.overrideValueByFieldMetadata(
            'id',
            id,
            fieldIdByName,
            flatObjectMetadata,
            flatFieldMetadataMaps,
          ),
        ) ?? [],
      ),
      data: await this.dataArgProcessor.process({
        partialRecordInputs: args.data,
        authContext,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        shouldBackfillPositionIfUndefined: false,
      }),
    };
  }

  async processQueryResult(
    queryResult: CommonFindDuplicatesOutputItem[],
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    authContext: WorkspaceAuthContext,
  ): Promise<CommonFindDuplicatesOutputItem[]> {
    const processedResults = await Promise.all(
      queryResult.map(async (result) => {
        return {
          ...result,
          records: await this.commonResultGettersService.processRecordArray(
            result.records,
            flatObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            authContext.workspace.id,
          ),
        };
      }),
    );

    return processedResults;
  }

  async validate(
    args: CommonInput<FindDuplicatesQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    if (!args.data && !args.ids) {
      throw new CommonQueryRunnerException(
        'You have to provide either "data" or "ids" argument',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    if (args.data && args.ids) {
      throw new CommonQueryRunnerException(
        'You cannot provide both "data" and "ids" arguments',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    if (!args.ids && isEmpty(args.data)) {
      throw new CommonQueryRunnerException(
        'The "data" condition can not be empty when "ids" input not provided',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }

  private normalizeRecordsForDuplicateLookup(
    records: Partial<ObjectRecord>[],
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): Partial<ObjectRecord>[] {
    return records.map((record) =>
      this.normalizeRecordForDuplicateLookup(
        record,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      ),
    );
  }

  private normalizeRecordForDuplicateLookup(
    record: Partial<ObjectRecord>,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): Partial<ObjectRecord> {
    const duplicateFields = new Set(
      (flatObjectMetadata.duplicateCriteria ?? []).flat(),
    );
    const compositeFieldMetadataMap = Array.isArray(flatObjectMetadata.fieldIds)
      ? getCompositeFieldMetadataMap(flatObjectMetadata, flatFieldMetadataMaps)
      : new Map();
    const normalizedRecord = { ...record };

    for (const duplicateField of duplicateFields) {
      delete normalizedRecord[duplicateField];

      const normalizedValue = this.normalizeDuplicateFieldValue(
        record,
        duplicateField,
        compositeFieldMetadataMap,
      );

      if (isDefined(normalizedValue)) {
        normalizedRecord[duplicateField] = normalizedValue;
      }
    }

    return normalizedRecord;
  }

  private normalizeDuplicateFieldValue(
    record: Partial<ObjectRecord>,
    duplicateField: string,
    compositeFieldMetadataMap: Map<
      string,
      {
        parentField: string;
        name: string;
      }
    >,
  ): string | undefined {
    const directValue = record[duplicateField];

    if (typeof directValue === 'string') {
      const trimmedValue = directValue.trim();

      return trimmedValue.length >= settings.minLengthOfStringForDuplicateCheck
        ? trimmedValue
        : undefined;
    }

    if (isDefined(directValue)) {
      return directValue as string;
    }

    const compositeFieldMetadata = compositeFieldMetadataMap.get(duplicateField);

    if (!compositeFieldMetadata) {
      return this.extractNestedDuplicateFieldValue(record, duplicateField);
    }

    const parentValue = record[compositeFieldMetadata.parentField];

    if (typeof parentValue !== 'object' || parentValue === null) {
      return undefined;
    }

    const nestedValue = parentValue[compositeFieldMetadata.name];

    if (typeof nestedValue !== 'string') {
      return undefined;
    }

    const trimmedValue = nestedValue.trim();

    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }

  private extractNestedDuplicateFieldValue(
    record: Partial<ObjectRecord>,
    duplicateField: string,
  ): string | undefined {
    for (const [parentField, parentValue] of Object.entries(record)) {
      if (
        typeof parentValue !== 'object' ||
        parentValue === null ||
        !duplicateField.startsWith(parentField)
      ) {
        continue;
      }

      const nestedFieldName = duplicateField.slice(parentField.length);

      if (nestedFieldName.length === 0) {
        continue;
      }

      const normalizedNestedFieldName =
        nestedFieldName.charAt(0).toLowerCase() + nestedFieldName.slice(1);
      const nestedValue = parentValue[normalizedNestedFieldName];

      if (typeof nestedValue !== 'string') {
        continue;
      }

      const trimmedValue = nestedValue.trim();

      return trimmedValue.length >= settings.minLengthOfStringForDuplicateCheck
        ? trimmedValue
        : undefined;
    }

    return undefined;
  }

  private buildDuplicateLookupColumns(
    columnsToSelect: Record<string, boolean>,
    flatObjectMetadata: FlatObjectMetadata,
  ): Record<string, boolean> {
    const duplicateLookupColumns = { ...columnsToSelect };

    for (const duplicateCriteria of flatObjectMetadata.duplicateCriteria ?? []) {
      for (const duplicateField of duplicateCriteria) {
        duplicateLookupColumns[duplicateField] = true;
      }
    }

    return duplicateLookupColumns;
  }

  private projectDuplicateRecord(
    record: ObjectRecord,
    columnsToSelect: Record<string, boolean>,
  ): ObjectRecord {
    const projectedRecordEntries = Object.entries(record).filter(
      ([key]) => key === 'id' || columnsToSelect[key] === true,
    );

    return Object.fromEntries(projectedRecordEntries) as ObjectRecord;
  }

  private shouldApplyFuzzyCompanyNameMatching(
    record: Partial<ObjectRecord>,
    flatObjectMetadata: FlatObjectMetadata,
  ): boolean {
    return (
      flatObjectMetadata.nameSingular === 'company' &&
      typeof record.name === 'string' &&
      record.name.length >= settings.minLengthOfStringForDuplicateCheck
    );
  }

  private filterDuplicateCandidatesByCriteria(
    duplicateCandidates: ObjectRecord[],
    sourceRecord: Partial<ObjectRecord>,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): ObjectRecord[] {
    const compositeFieldMetadataMap = getCompositeFieldMetadataMap(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    return duplicateCandidates.filter((candidateRecord) =>
      (flatObjectMetadata.duplicateCriteria ?? []).some((duplicateCriteria) =>
        duplicateCriteria.every((duplicateField) => {
          const sourceValue = this.normalizeDuplicateFieldValue(
            sourceRecord,
            duplicateField,
            compositeFieldMetadataMap,
          );
          const candidateValue = this.normalizeDuplicateFieldValue(
            candidateRecord,
            duplicateField,
            compositeFieldMetadataMap,
          );

          if (!isDefined(sourceValue) || !isDefined(candidateValue)) {
            return false;
          }

          if (
            flatObjectMetadata.nameSingular === 'company' &&
            duplicateCriteria.length === 1 &&
            duplicateField === 'name'
          ) {
            return (
              calculateNormalizedStringSimilarity(sourceValue, candidateValue) >=
              settings.duplicateNameSimilarityThreshold
            );
          }

          return sourceValue === candidateValue;
        }),
      ),
    );
  }
}
