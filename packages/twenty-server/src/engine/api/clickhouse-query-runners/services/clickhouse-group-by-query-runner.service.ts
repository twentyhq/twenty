import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  type ObjectRecordFilter,
  type ObjectRecordGroupBy,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';

import {
  type ClickHouseQueryArgs,
  type ClickHouseQueryRunnerContext,
} from '../types/clickhouse-query-runner-context.type';
import { buildClickHouseGroupByQuery } from '../utils/clickhouse-query-builder.util';

type ClickHouseGroupByArgs = ClickHouseQueryArgs & {
  filter?: ObjectRecordFilter;
  groupBy?: ObjectRecordGroupBy;
  orderBy?: ObjectRecordOrderBy;
  limit?: number;
  includeRecords?: boolean;
};

@Injectable()
export class ClickHouseGroupByQueryRunnerService {
  private readonly logger = new Logger(ClickHouseGroupByQueryRunnerService.name);

  constructor(private readonly clickHouseService: ClickHouseService) {}

  async execute(
    args: ClickHouseGroupByArgs,
    context: ClickHouseQueryRunnerContext,
  ): Promise<CommonGroupByOutputItem[]> {
    const { tableName, authContext } = context;

    // Extract group by columns from args
    const groupByColumns = this.extractGroupByColumns(args.groupBy);

    if (groupByColumns.length === 0) {
      return [];
    }

    // Convert orderBy to simple format for ClickHouse
    const orderBy = this.convertOrderBy(args.orderBy);

    // Build and execute the query
    const { query, params } = buildClickHouseGroupByQuery({
      tableName,
      groupByColumns,
      filter: args.filter,
      orderBy,
      limit: args.limit ?? 100,
      workspaceId: authContext.workspace.id,
    });

    this.logger.debug(`Executing ClickHouse groupBy query: ${query}`);
    this.logger.debug(`With params: ${JSON.stringify(params)}`);

    const rawResults = await this.clickHouseService.select<Record<string, unknown>>(
      query,
      params,
    );

    // Format results into CommonGroupByOutputItem format
    return this.formatGroupByResults(rawResults, groupByColumns);
  }

  private extractGroupByColumns(groupBy?: ObjectRecordGroupBy): string[] {
    if (!isDefined(groupBy) || groupBy.length === 0) {
      return [];
    }

    const columns: string[] = [];

    for (const groupByItem of groupBy) {
      for (const [fieldName, value] of Object.entries(groupByItem)) {
        if (value === true) {
          // Simple field grouping
          columns.push(fieldName);
        } else if (typeof value === 'object' && value !== null) {
          // Composite field or date granularity grouping
          if ('granularity' in value) {
            // Date granularity - for now just use the field
            columns.push(fieldName);
          } else {
            // Composite field - extract sub-fields
            for (const [subFieldName, subValue] of Object.entries(value)) {
              if (subValue === true) {
                columns.push(`${fieldName}_${subFieldName}`);
              }
            }
          }
        }
      }
    }

    return columns;
  }

  private formatGroupByResults(
    rawResults: Record<string, unknown>[],
    groupByColumns: string[],
  ): CommonGroupByOutputItem[] {
    return rawResults.map((row) => {
      const result: CommonGroupByOutputItem = {
        totalCount: Number(row.totalCount ?? 0),
      };

      // Add dimension values
      for (const column of groupByColumns) {
        result[column] = row[column];
      }

      // Add any additional aggregated values
      for (const [key, value] of Object.entries(row)) {
        if (key !== 'totalCount' && !groupByColumns.includes(key)) {
          result[key] = value;
        }
      }

      return result;
    });
  }

  private convertOrderBy(
    orderBy?: ObjectRecordOrderBy,
  ): Array<Record<string, string>> | undefined {
    if (!isDefined(orderBy) || orderBy.length === 0) {
      return undefined;
    }

    return orderBy.map((item) => {
      const result: Record<string, string> = {};

      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'string') {
          result[key] = value;
        } else if (typeof value === 'object' && value !== null) {
          const direction = (value as Record<string, string>).direction;

          if (direction) {
            result[key] = direction;
          }
        }
      }

      return result;
    });
  }
}
