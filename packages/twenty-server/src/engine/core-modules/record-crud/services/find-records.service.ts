import { Injectable, Logger } from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { OrderByDirection } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { getAllSelectableColumnNames } from 'src/engine/api/utils/get-all-selectable-column-names.utils';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { type FindRecordsParams } from 'src/engine/core-modules/record-crud/types/find-records-params.type';
import { FindRecordsResult } from 'src/engine/core-modules/record-crud/types/find-records-result.type';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class FindRecordsService {
  private readonly logger = new Logger(FindRecordsService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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

    const authContext = buildSystemAuthContext(workspaceId);

    try {
      return await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const repository = await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            objectName,
            rolePermissionConfig,
          );

          const {
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            objectIdByNameSingular,
          } = repository.internalContext;

          const objectId = objectIdByNameSingular[objectName];

          if (!isDefined(objectId)) {
            throw new RecordCrudException(
              `Object ${objectName} not found`,
              RecordCrudExceptionCode.INVALID_REQUEST,
            );
          }

          const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityMaps: flatObjectMetadataMaps,
            flatEntityId: objectId,
          });

          const graphqlQueryParser = new GraphqlQueryParser(
            flatObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          );

          const records = await this.getObjectRecords({
            objectName,
            filter,
            orderBy,
            limit,
            offset,
            repository,
            graphqlQueryParser,
            flatObjectMetadata,
            flatFieldMetadataMaps,
          });

          const totalCount = await this.getTotalCount({
            objectName,
            filter,
            repository,
            graphqlQueryParser,
            flatObjectMetadata,
            flatFieldMetadataMaps,
          });

          this.logger.log(`Found ${records.length} records in ${objectName}`);

          const recordReferences = records.map((record) => ({
            objectNameSingular: objectName,
            recordId: record.id as string,
            displayName: getRecordDisplayName(
              record,
              flatObjectMetadata,
              flatFieldMetadataMaps,
            ),
          }));

          return {
            success: true,
            message: `Found ${records.length} ${objectName} records`,
            result: {
              records,
              count: totalCount,
            },
            recordReferences,
          };
        },
      );
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
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): WorkspaceSelectQueryBuilder<T> {
    const restrictedFields =
      repository.objectRecordsPermissions?.[flatObjectMetadata.id]
        ?.restrictedFields;

    if (!restrictedFields || isEmpty(restrictedFields)) {
      return queryBuilder;
    }

    const selectableFields = getAllSelectableColumnNames({
      restrictedFields,
      objectMetadata: {
        objectMetadataMapItem: flatObjectMetadata,
        flatFieldMetadataMaps,
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
    flatObjectMetadata,
    flatFieldMetadataMaps,
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
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
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
      flatObjectMetadata,
      flatFieldMetadataMaps,
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
    flatObjectMetadata,
    flatFieldMetadataMaps,
  }: {
    objectName: string;
    filter:
      | Partial<ObjectRecordFilter>
      | Partial<ObjectRecordFilter>[]
      | undefined;
    repository: WorkspaceRepository<ObjectLiteral>;
    graphqlQueryParser: GraphqlQueryParser;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
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
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    return queryBuilderWithSelect.getCount();
  }
}
