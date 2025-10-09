import { Injectable, Logger } from '@nestjs/common';

import { type Entity } from '@microsoft/microsoft-graph-types';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { type ObjectLiteral } from 'typeorm';

import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type FindRecordsParams } from 'src/engine/core-modules/record-crud/types/record-crud-params.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class FindRecordsService {
  private readonly logger = new Logger(FindRecordsService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async execute(params: FindRecordsParams): Promise<ToolOutput> {
    const {
      objectName,
      filter,
      orderBy,
      limit,
      offset = 0,
      workspaceId,
      roleId,
    } = params;

    if (!workspaceId) {
      return {
        success: false,
        message: 'Failed to find records: Workspace ID is required',
        error: 'Workspace ID not found',
      };
    }

    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          roleId ? { roleId } : { shouldBypassPermissionChecks: true },
        );

      const { objectMetadataItemWithFieldsMaps, objectMetadataMaps } =
        await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
          objectName,
          workspaceId,
        );

      const graphqlQueryParser = new GraphqlQueryParser(
        objectMetadataItemWithFieldsMaps,
        objectMetadataMaps,
      );

      const records = await this.getObjectRecords({
        objectName,
        filter,
        orderBy,
        limit,
        offset,
        repository,
        graphqlQueryParser,
      });

      const totalCount = await this.getTotalCount({
        objectName,
        filter,
        repository,
        graphqlQueryParser,
      });

      this.logger.log(`Found ${records.length} records in ${objectName}`);

      return {
        success: true,
        message: `Found ${records.length} ${objectName} records`,
        result: {
          records,
          count: totalCount,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to find records: ${error}`);

      return {
        success: false,
        message: `Failed to find ${objectName} records`,
        error:
          error instanceof Error ? error.message : 'Failed to find records',
      };
    }
  }

  private async getObjectRecords<T extends ObjectLiteral>({
    objectName,
    filter,
    orderBy,
    limit,
    offset,
    repository,
    graphqlQueryParser,
  }: {
    objectName: string;
    filter:
      | Partial<ObjectRecordFilter>
      | Partial<ObjectRecordFilter>[]
      | undefined;
    orderBy: Partial<ObjectRecordOrderBy> | undefined;
    limit: number | undefined;
    offset: number;
    repository: WorkspaceRepository<T>;
    graphqlQueryParser: GraphqlQueryParser;
  }): Promise<T[]> {
    const queryBuilder = repository.createQueryBuilder(objectName);

    const withFilterQueryBuilder = graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectName,
      filter ?? ({} as ObjectRecordFilter),
    );

    const orderByWithIdCondition = [
      ...(orderBy ?? []),
      { id: OrderByDirection.AscNullsFirst },
    ] as ObjectRecordOrderBy;

    const withOrderByQueryBuilder = graphqlQueryParser.applyOrderToBuilder(
      withFilterQueryBuilder,
      orderByWithIdCondition,
      objectName,
      false,
    );

    return withOrderByQueryBuilder
      .skip(offset)
      .take(limit ? Math.min(limit, QUERY_MAX_RECORDS) : QUERY_MAX_RECORDS)
      .getMany();
  }

  private async getTotalCount({
    objectName,
    filter,
    repository,
    graphqlQueryParser,
  }: {
    objectName: string;
    filter:
      | Partial<ObjectRecordFilter>
      | Partial<ObjectRecordFilter>[]
      | undefined;
    repository: WorkspaceRepository<Entity>;
    graphqlQueryParser: GraphqlQueryParser;
  }): Promise<number> {
    const countQueryBuilder = repository.createQueryBuilder(objectName);

    const withFilterCountQueryBuilder = graphqlQueryParser.applyFilterToBuilder(
      countQueryBuilder,
      objectName,
      filter ?? ({} as ObjectRecordFilter),
    );

    const withDeletedCountQueryBuilder =
      graphqlQueryParser.applyDeletedAtToBuilder(
        withFilterCountQueryBuilder,
        filter ?? ({} as ObjectRecordFilter),
      );

    return withDeletedCountQueryBuilder.getCount();
  }
}
