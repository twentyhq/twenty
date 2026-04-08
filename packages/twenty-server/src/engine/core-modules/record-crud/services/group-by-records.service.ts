import { Injectable, Logger } from '@nestjs/common';

import {
  AggregateOperations,
  ObjectRecordGroupByDateGranularity,
  OrderByDirection,
  type OrderByWithGroupBy,
} from 'twenty-shared/types';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';

import { type ObjectRecordGroupBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { parseGroupByArgs } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/parse-group-by-args.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { getAvailableAggregationsFromObjectFields } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type GroupByRecordsParams } from 'src/engine/core-modules/record-crud/types/group-by-records-params.type';
import { type GroupByRecordsResult } from 'src/engine/core-modules/record-crud/types/group-by-records-result.type';
import { resolveAggregateFieldKey } from 'src/engine/core-modules/record-crud/utils/resolve-aggregate-field-key.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';

@Injectable()
export class GroupByRecordsService {
  private readonly logger = new Logger(GroupByRecordsService.name);

  constructor(
    private readonly commonGroupByRunner: CommonGroupByQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
  ) {}

  async execute(
    params: GroupByRecordsParams,
  ): Promise<ToolOutput<GroupByRecordsResult>> {
    const {
      objectName,
      groupBy,
      dateGranularity,
      timeZone,
      aggregateOperation = AggregateOperations.COUNT,
      aggregateFieldName,
      limit,
      orderBy = 'DESC',
      filter,
      authContext,
    } = params;

    try {
      const {
        queryRunnerContext,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      } = await this.commonApiContextBuilder.build({
        authContext,
        objectName,
      });

      const fields = getFlatFieldsFromFlatObjectMetadata(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      );

      const { fieldIdByJoinColumnName } = buildFieldMapsFromFlatObjectMetadata(
        flatFieldMetadataMaps,
        flatObjectMetadata,
      );
      const dateFieldNames = new Set(
        fields
          .filter((field) => isFieldMetadataDateKind(field.type))
          .map((field) => field.name),
      );
      const dateFieldCount = groupBy.filter((fieldName) =>
        dateFieldNames.has(fieldName),
      ).length;

      this.validateDateGranularity({
        dateGranularity,
        dateFieldCount,
      });

      const { objectRecordGroupBy, dimensionLabels } =
        this.buildObjectRecordGroupBy({
          groupBy,
          dateFieldNames,
          dateGranularity,
          timeZone,
          fieldIdByJoinColumnName,
          flatFieldMetadataMaps,
        });
      const groupByFields = parseGroupByArgs(
        {
          groupBy: objectRecordGroupBy,
        },
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      );

      const availableAggregations =
        getAvailableAggregationsFromObjectFields(fields);
      let aggregateFieldKey: string;

      if (aggregateOperation === AggregateOperations.COUNT) {
        if (aggregateFieldName) {
          throw new RecordCrudException(
            'aggregateFieldName is not supported for COUNT operation',
            RecordCrudExceptionCode.INVALID_REQUEST,
          );
        }

        aggregateFieldKey = 'totalCount';
      } else {
        if (!aggregateFieldName) {
          throw new RecordCrudException(
            `aggregateFieldName is required for ${aggregateOperation} operation`,
            RecordCrudExceptionCode.INVALID_REQUEST,
          );
        }

        const resolvedKey = resolveAggregateFieldKey(
          aggregateOperation,
          aggregateFieldName,
          availableAggregations,
        );

        if (!resolvedKey) {
          throw new RecordCrudException(
            `No aggregation available for ${aggregateOperation} on field "${aggregateFieldName}"`,
            RecordCrudExceptionCode.INVALID_REQUEST,
          );
        }

        aggregateFieldKey = resolvedKey;
      }

      const selectedFields = {
        [aggregateFieldKey]: true,
        groupByDimensionValues: true,
      };

      const mappedOrderBy: OrderByWithGroupBy = [
        {
          aggregate: {
            [aggregateFieldKey]:
              orderBy === 'ASC'
                ? OrderByDirection.AscNullsLast
                : OrderByDirection.DescNullsLast,
          },
        },
      ];

      const { results } = await this.commonGroupByRunner.execute(
        {
          filter: filter ?? {},
          groupBy: objectRecordGroupBy,
          groupByFields,
          orderBy: mappedOrderBy,
          selectedFields,
          limit,
        },
        queryRunnerContext,
      );

      this.logger.log(
        `Grouped ${objectName} by ${groupBy.join(', ')}: ${results.length} groups`,
      );

      return {
        success: true,
        message: `Grouped ${objectName} by ${dimensionLabels.join(', ')}: ${results.length} groups`,
        result: {
          groups: results.map((item) => ({
            dimensions: item.groupByDimensionValues,
            value: item[aggregateFieldKey],
          })),
          dimensionLabels,
          aggregation: aggregateOperation,
          groupCount: results.length,
        },
      };
    } catch (error) {
      if (error instanceof RecordCrudException) {
        return {
          success: false,
          message: `Failed to group ${objectName} records`,
          error: error.message,
        };
      }

      this.logger.error(`Failed to group records: ${error}`);

      return {
        success: false,
        message: `Failed to group ${objectName} records`,
        error:
          error instanceof Error ? error.message : 'Failed to group records',
      };
    }
  }

  private validateDateGranularity({
    dateGranularity,
    dateFieldCount,
  }: {
    dateGranularity?: ObjectRecordGroupByDateGranularity;
    dateFieldCount: number;
  }): void {
    if (dateFieldCount > 1) {
      throw new RecordCrudException(
        'Cannot group by two date fields — dateGranularity is ambiguous',
        RecordCrudExceptionCode.INVALID_REQUEST,
      );
    }

    if (dateGranularity && dateFieldCount === 0) {
      throw new RecordCrudException(
        'dateGranularity requires exactly one date field in groupBy',
        RecordCrudExceptionCode.INVALID_REQUEST,
      );
    }
  }

  private buildObjectRecordGroupBy({
    groupBy,
    dateFieldNames,
    dateGranularity,
    timeZone,
    fieldIdByJoinColumnName,
    flatFieldMetadataMaps,
  }: {
    groupBy: string[];
    dateFieldNames: Set<string>;
    dateGranularity?: ObjectRecordGroupByDateGranularity;
    timeZone?: string;
    fieldIdByJoinColumnName: Record<string, string>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): {
    objectRecordGroupBy: ObjectRecordGroupBy;
    dimensionLabels: string[];
  } {
    const objectRecordGroupBy: ObjectRecordGroupBy = [];
    const dimensionLabels: string[] = [];

    for (const fieldName of groupBy) {
      if (fieldName.includes('.')) {
        const fieldPathParts = fieldName.split('.');

        if (
          fieldPathParts.length !== 2 ||
          fieldPathParts.some((fieldPathPart) => fieldPathPart.length === 0)
        ) {
          throw new RecordCrudException(
            `Invalid groupBy field "${fieldName}"`,
            RecordCrudExceptionCode.INVALID_REQUEST,
          );
        }

        const [parentField, subField] = fieldPathParts;

        objectRecordGroupBy.push({ [parentField]: { [subField]: true } });
        dimensionLabels.push(fieldName);
        continue;
      }

      const relationFieldId = fieldIdByJoinColumnName[fieldName];

      if (relationFieldId) {
        const relationFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: relationFieldId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

        if (!relationFieldMetadata) {
          throw new RecordCrudException(
            `Invalid relation groupBy field "${fieldName}"`,
            RecordCrudExceptionCode.INVALID_REQUEST,
          );
        }

        objectRecordGroupBy.push({
          [relationFieldMetadata.name]: { id: true },
        });
        dimensionLabels.push(fieldName);
        continue;
      }

      if (dateFieldNames.has(fieldName)) {
        objectRecordGroupBy.push({
          [fieldName]: {
            granularity:
              dateGranularity ?? ObjectRecordGroupByDateGranularity.MONTH,
            timeZone: timeZone ?? 'UTC',
          },
        });
        dimensionLabels.push(fieldName);
        continue;
      }

      objectRecordGroupBy.push({ [fieldName]: true });
      dimensionLabels.push(fieldName);
    }

    return {
      objectRecordGroupBy,
      dimensionLabels,
    };
  }
}
