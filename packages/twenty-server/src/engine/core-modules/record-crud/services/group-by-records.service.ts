import { Injectable, Logger } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import {
  AggregateOperations,
  OrderByDirection,
  type OrderByWithGroupBy,
} from 'twenty-shared/types';

import { GroupByArgProcessorService } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/group-by-arg-processor.service';
import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type GroupByRecordsParams } from 'src/engine/core-modules/record-crud/types/group-by-records-params.type';
import { type GroupByRecordsResult } from 'src/engine/core-modules/record-crud/types/group-by-records-result.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class GroupByRecordsService {
  private readonly logger = new Logger(GroupByRecordsService.name);

  constructor(
    private readonly commonGroupByRunner: CommonGroupByQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
    private readonly groupByArgProcessor: GroupByArgProcessorService,
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
      const {
        queryRunnerContext,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        objectsPermissions,
      } = await this.commonApiContextBuilder.build({
        authContext,
        objectName,
      });

      const availableAggregations =
        this.groupByArgProcessor.getAvailableAggregations({
          flatObjectMetadata,
          flatFieldMetadataMaps,
          restrictedFields:
            objectsPermissions[flatObjectMetadata.id]?.restrictedFields,
        });

      let aggregateFieldKey: string;

      try {
        aggregateFieldKey =
          this.groupByArgProcessor.resolveToolAggregateFieldKeyOrThrow({
            aggregateOperation,
            aggregateFieldName,
            availableAggregations,
          });
      } catch (error) {
        if (error instanceof CommonQueryRunnerException) {
          throw new RecordCrudException(
            error.message,
            RecordCrudExceptionCode.INVALID_REQUEST,
          );
        }

        throw error;
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

      const clampedLimit = limit
        ? Math.min(limit, QUERY_MAX_RECORDS)
        : QUERY_MAX_RECORDS;

      const { results } = await this.commonGroupByRunner.execute(
        {
          filter: filter ?? {},
          groupBy,
          orderBy: mappedOrderBy,
          selectedFields,
          limit: clampedLimit,
        },
        queryRunnerContext,
      );

      const dimensionLabels = groupBy.map((entry) =>
        this.getDimensionLabelFromGroupByEntry(entry),
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
    entry: GroupByRecordsParams['groupBy'][number],
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
