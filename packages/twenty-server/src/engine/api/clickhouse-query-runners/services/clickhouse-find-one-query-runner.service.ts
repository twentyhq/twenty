import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';

import {
  type ClickHouseQueryArgs,
  type ClickHouseQueryRunnerContext,
} from '../types/clickhouse-query-runner-context.type';
import { buildClickHouseSelectQuery } from '../utils/clickhouse-query-builder.util';

type ClickHouseFindOneArgs = ClickHouseQueryArgs & {
  filter?: ObjectRecordFilter;
};

@Injectable()
export class ClickHouseFindOneQueryRunnerService {
  private readonly logger = new Logger(ClickHouseFindOneQueryRunnerService.name);

  constructor(private readonly clickHouseService: ClickHouseService) {}

  async execute(
    args: ClickHouseFindOneArgs,
    context: ClickHouseQueryRunnerContext,
  ): Promise<ObjectRecord> {
    const { tableName, authContext, flatObjectMetadata, flatFieldMetadataMaps } =
      context;

    // Validate filter is provided
    if (!args.filter || Object.keys(args.filter).length === 0) {
      throw new CommonQueryRunnerException(
        'Missing filter argument',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: msg`Filter is required for findOne queries.` },
      );
    }

    // Get columns from selected fields
    const columns = this.getColumnsFromSelectedFields(
      args.selectedFieldsResult,
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    // Build and execute the query
    const { query, params } = buildClickHouseSelectQuery({
      tableName,
      columns,
      filter: args.filter,
      limit: 1,
      workspaceId: authContext.workspace.id,
    });

    this.logger.debug(`Executing ClickHouse findOne query: ${query}`);
    this.logger.debug(`With params: ${JSON.stringify(params)}`);

    const records = await this.clickHouseService.select<ObjectRecord>(
      query,
      params,
    );

    if (records.length === 0) {
      throw new CommonQueryRunnerException(
        'Record not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
        {
          userFriendlyMessage: msg`This record does not exist or has been deleted.`,
        },
      );
    }

    return records[0];
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
        // If field not found in metadata, include it anyway
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

    return (
      fieldMetadata.type === 'RELATION' || fieldMetadata.type === 'MORPH_MANY'
    );
  }
}
