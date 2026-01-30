import { Injectable, Logger } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type CommonFindManyOutput } from 'src/engine/api/common/types/common-find-many-output.type';
import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';

import {
  type ClickHouseQueryArgs,
  type ClickHouseQueryRunnerContext,
} from '../types/clickhouse-query-runner-context.type';
import {
  buildClickHouseCountQuery,
  buildClickHouseSelectQuery,
} from '../utils/clickhouse-query-builder.util';

type ClickHouseFindManyArgs = ClickHouseQueryArgs & {
  filter?: ObjectRecordFilter;
  orderBy?: ObjectRecordOrderBy;
  first?: number;
  last?: number;
  before?: string;
  after?: string;
  offset?: number;
};

@Injectable()
export class ClickHouseFindManyQueryRunnerService {
  private readonly logger = new Logger(ClickHouseFindManyQueryRunnerService.name);

  constructor(private readonly clickHouseService: ClickHouseService) {}

  async execute(
    args: ClickHouseFindManyArgs,
    context: ClickHouseQueryRunnerContext,
  ): Promise<CommonFindManyOutput> {
    const { tableName, authContext, flatObjectMetadata, flatFieldMetadataMaps } =
      context;

    const limit = args.first ?? args.last ?? QUERY_MAX_RECORDS;
    const offset = args.offset ?? 0;

    // Get columns from selected fields
    const columns = this.getColumnsFromSelectedFields(
      args.selectedFieldsResult,
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    // Convert orderBy to simple format for ClickHouse
    const orderBy = this.convertOrderBy(args.orderBy);

    // Build and execute the query
    const { query, params } = buildClickHouseSelectQuery({
      tableName,
      columns,
      filter: args.filter,
      orderBy,
      limit: limit + 1, // Fetch one extra to check for next page
      offset,
      workspaceId: authContext.workspace.id,
    });

    this.logger.debug(`Executing ClickHouse query: ${query}`);
    this.logger.debug(`With params: ${JSON.stringify(params)}`);

    const records = await this.clickHouseService.select<ObjectRecord>(
      query,
      params,
    );

    // Get total count
    const { query: countQuery, params: countParams } = buildClickHouseCountQuery(
      {
        tableName,
        filter: args.filter,
        workspaceId: authContext.workspace.id,
      },
    );

    const countResult = await this.clickHouseService.select<{
      totalCount: number;
    }>(countQuery, countParams);

    const totalCount = countResult[0]?.totalCount ?? 0;

    // Check if there's a next page
    const hasNextPage = records.length > limit;

    if (hasNextPage) {
      records.pop(); // Remove the extra record we fetched
    }

    return {
      records,
      aggregatedValues: { totalCount },
      totalCount,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: offset > 0,
      },
      selectedFieldsResult: args.selectedFieldsResult,
    };
  }

  private getColumnsFromSelectedFields(
    selectedFieldsResult: CommonSelectedFieldsResult,
    flatObjectMetadata: ClickHouseQueryRunnerContext['flatObjectMetadata'],
    flatFieldMetadataMaps: ClickHouseQueryRunnerContext['flatFieldMetadataMaps'],
  ): string[] {
    const selectFields = selectedFieldsResult.select;

    if (!isDefined(selectFields) || Object.keys(selectFields).length === 0) {
      return ['*'];
    }

    // Extract column names from selected fields
    const columns: string[] = [];

    for (const fieldName of Object.keys(selectFields)) {
      // Skip relation fields for ClickHouse - we don't support them
      const fieldId = Object.keys(flatFieldMetadataMaps.byId).find(
        (id) => flatFieldMetadataMaps.byId[id]?.name === fieldName,
      );

      if (fieldId) {
        const fieldMetadata = flatFieldMetadataMaps.byId[fieldId];

        if (fieldMetadata && !this.isRelationField(fieldMetadata)) {
          columns.push(fieldName);
        }
      } else {
        // If field not found in metadata, include it anyway (might be a computed field)
        columns.push(fieldName);
      }
    }

    // Always include id if not already included
    if (!columns.includes('id')) {
      columns.unshift('id');
    }

    return columns;
  }

  private isRelationField(
    fieldMetadata: ClickHouseQueryRunnerContext['flatFieldMetadataMaps']['byId'][string],
  ): boolean {
    if (!fieldMetadata) {
      return false;
    }

    // Check if it's a relation type field
    return (
      fieldMetadata.type === 'RELATION' || fieldMetadata.type === 'MORPH_MANY'
    );
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
          // Handle nested direction (for composite fields)
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
