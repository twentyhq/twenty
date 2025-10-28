import { Injectable, Logger } from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { OrderByDirection } from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { getAllSelectableColumnNames } from 'src/engine/api/utils/get-all-selectable-column-names.utils';
import { type FindRecordsParams } from 'src/engine/core-modules/record-crud/types/find-records-params.type';
import { FindRecordsResult } from 'src/engine/core-modules/record-crud/types/find-records-result.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
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

  async execute(
    params: FindRecordsParams,
  ): Promise<ToolOutput<FindRecordsResult>> {
    const {
      objectName,
      filter,
      orderBy,
      limit,
      offset = 0,
      workspaceId,
      rolePermissionConfig,
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
          rolePermissionConfig,
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
        objectMetadataItemWithFieldsMaps,
      });

      const totalCount = await this.getTotalCount({
        objectName,
        filter,
        repository,
        graphqlQueryParser,
        objectMetadataItemWithFieldsMaps,
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

  private applyRestrictedFieldsToQueryBuilder<T extends ObjectLiteral>(
    queryBuilder: WorkspaceSelectQueryBuilder<T>,
    repository: WorkspaceRepository<T>,
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps,
  ): WorkspaceSelectQueryBuilder<T> {
    const restrictedFields =
      repository.objectRecordsPermissions?.[objectMetadataItemWithFieldsMaps.id]
        ?.restrictedFields;

    if (!restrictedFields || isEmpty(restrictedFields)) {
      return queryBuilder;
    }

    const selectableFields = getAllSelectableColumnNames({
      restrictedFields,
      objectMetadata: {
        objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
      },
    });

    return queryBuilder.setFindOptions({
      // @ts-expect-error - TypeORM typing limitation with dynamic select fields
      select: selectableFields,
    });
  }

  private async getObjectRecords<T extends ObjectLiteral>({
    objectName,
    filter,
    orderBy,
    limit,
    offset,
    repository,
    graphqlQueryParser,
    objectMetadataItemWithFieldsMaps,
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
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<T[]> {
    const queryBuilder = repository.createQueryBuilder(objectName);

    const withFilterQueryBuilder = graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectName,
      filter ?? {},
    );

    const orderByWithIdCondition: ObjectRecordOrderBy = [
      ...(orderBy ?? []).filter((item) => item !== undefined),
      { id: OrderByDirection.AscNullsFirst },
    ];

    const withOrderByQueryBuilder = graphqlQueryParser.applyOrderToBuilder(
      withFilterQueryBuilder,
      orderByWithIdCondition,
      objectName,
      true,
    );

    const queryBuilderWithSelect = this.applyRestrictedFieldsToQueryBuilder(
      withOrderByQueryBuilder,
      repository,
      objectMetadataItemWithFieldsMaps,
    );

    return queryBuilderWithSelect
      .skip(offset)
      .take(limit ? Math.min(limit, QUERY_MAX_RECORDS) : QUERY_MAX_RECORDS)
      .getMany();
  }

  private async getTotalCount({
    objectName,
    filter,
    repository,
    graphqlQueryParser,
    objectMetadataItemWithFieldsMaps,
  }: {
    objectName: string;
    filter:
      | Partial<ObjectRecordFilter>
      | Partial<ObjectRecordFilter>[]
      | undefined;
    repository: WorkspaceRepository<ObjectLiteral>;
    graphqlQueryParser: GraphqlQueryParser;
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<number> {
    const countQueryBuilder = repository.createQueryBuilder(objectName);

    const withFilterCountQueryBuilder = graphqlQueryParser.applyFilterToBuilder(
      countQueryBuilder,
      objectName,
      filter ?? {},
    );

    const withDeletedCountQueryBuilder =
      graphqlQueryParser.applyDeletedAtToBuilder(
        withFilterCountQueryBuilder,
        filter ?? {},
      );

    const queryBuilderWithSelect = this.applyRestrictedFieldsToQueryBuilder(
      withDeletedCountQueryBuilder,
      repository,
      objectMetadataItemWithFieldsMaps,
    );

    return queryBuilderWithSelect.getCount();
  }
}
