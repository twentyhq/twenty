import { Injectable, Logger } from '@nestjs/common';

import {
  AggregateOperations,
  OrderByDirection,
  type OrderByWithGroupBy,
} from 'twenty-shared/types';

import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
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
      aggregateOperation = AggregateOperations.COUNT,
      aggregateFieldName,
      limit,
      orderBy = 'DESC',
      filter,
      authContext,
    } = params;

    try {
      const { queryRunnerContext, flatObjectMetadata, flatFieldMetadataMaps } =
        await this.commonApiContextBuilder.build({
          authContext,
          objectName,
        });

      const fields = getFlatFieldsFromFlatObjectMetadata(
        flatObjectMetadata,
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
          groupBy,
          orderBy: mappedOrderBy,
          selectedFields,
          limit,
        },
        queryRunnerContext,
      );

      const dimensionLabels = groupBy.map((entry) =>
        this.getDimensionLabelFromGroupByEntry(
          entry as Record<string, unknown>,
        ),
      );

      this.logger.log(
        `Grouped ${objectName} by ${dimensionLabels.join(', ')}: ${results.length} groups`,
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

  private getDimensionLabelFromGroupByEntry(
    entry: Record<string, unknown>,
  ): string {
    const fieldEntries = Object.entries(entry);

    if (fieldEntries.length === 0) {
      return '';
    }

    const [fieldName, fieldDefinition] = fieldEntries[0];

    if (fieldDefinition === true) {
      return fieldName;
    }

    if (typeof fieldDefinition !== 'object' || fieldDefinition === null) {
      return fieldName;
    }

    const nestedEntries = Object.entries(fieldDefinition);

    if (nestedEntries.length !== 1) {
      return fieldName;
    }

    const [nestedFieldName, nestedFieldDefinition] = nestedEntries[0];

    if (nestedFieldDefinition !== true) {
      return fieldName;
    }

    if (nestedFieldName === 'id' && fieldName.endsWith('Id')) {
      return fieldName;
    }

    return `${fieldName}.${nestedFieldName}`;
  }
}
