import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { In, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  ObjectRecord,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { ApiEventEmitterService } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { formatResult as formatGetManyData } from 'src/engine/twenty-orm/utils/format-result.util';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { GetVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/get-variables.factory';
import { QueryVariables } from 'src/engine/api/rest/core/types/query-variables.type';
import { Depth } from 'src/engine/api/rest/input-factories/depth-input.factory';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

interface PageInfo {
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

interface FormatResultParams<T> {
  operation: 'delete' | 'create' | 'update' | 'findOne' | 'findMany';
  objectNameSingular?: string;
  objectNamePlural?: string;
  data: T;
  pageInfo?: PageInfo;
  totalCount?: number;
}
@Injectable()
export class RestApiCoreServiceV2 {
  constructor(
    private readonly coreQueryBuilderFactory: CoreQueryBuilderFactory,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly getVariablesFactory: GetVariablesFactory,
    private readonly recordInputTransformerService: RecordInputTransformerService,
    protected readonly apiEventEmitterService: ApiEventEmitterService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
  ) {}

  async delete(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadataNameSingular, objectMetadata, repository } =
      await this.getRepositoryAndMetadataOrFail(request);
    const recordToDelete = await repository.findOneOrFail({
      where: { id: recordId },
    });

    await repository.delete(recordId);

    this.apiEventEmitterService.emitDestroyEvents(
      [recordToDelete],
      this.getAuthContextFromRequest(request),
      objectMetadata.objectMetadataMapItem,
    );

    return this.formatResult({
      operation: 'delete',
      objectNameSingular: objectMetadataNameSingular,
      data: {
        id: recordToDelete.id,
      },
    });
  }

  async createOne(request: Request) {
    const { objectMetadataNameSingular, objectMetadata, repository } =
      await this.getRepositoryAndMetadataOrFail(request);

    const overriddenBody = await this.recordInputTransformerService.process({
      recordInput: request.body,
      objectMetadataMapItem: objectMetadata.objectMetadataMapItem,
    });

    const recordExists =
      isDefined(overriddenBody.id) &&
      (await repository.exists({
        where: {
          id: overriddenBody.id,
        },
      }));

    if (recordExists) {
      throw new BadRequestException('Record already exists');
    }

    const createdRecord = await repository.save(overriddenBody);

    this.apiEventEmitterService.emitCreateEvents(
      [createdRecord],
      this.getAuthContextFromRequest(request),
      objectMetadata.objectMetadataMapItem,
    );

    return this.formatResult({
      operation: 'create',
      objectNameSingular: objectMetadataNameSingular,
      data: createdRecord,
    });
  }

  async update(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadataNameSingular, objectMetadata, repository } =
      await this.getRepositoryAndMetadataOrFail(request);

    const recordToUpdate = await repository.findOneOrFail({
      where: { id: recordId },
    });

    const overriddenBody = await this.recordInputTransformerService.process({
      recordInput: request.body,
      objectMetadataMapItem: objectMetadata.objectMetadataMapItem,
    });

    const updatedRecord = await repository.save({
      ...recordToUpdate,
      ...overriddenBody,
    });

    this.apiEventEmitterService.emitUpdateEvents(
      [recordToUpdate],
      [updatedRecord],
      Object.keys(request.body),
      this.getAuthContextFromRequest(request),
      objectMetadata.objectMetadataMapItem,
    );

    return this.formatResult({
      operation: 'update',
      objectNameSingular: objectMetadataNameSingular,
      data: updatedRecord,
    });
  }

  async get(request: Request) {
    const { id: recordId } = parseCorePath(request);
    const {
      objectMetadataNameSingular,
      objectMetadataNamePlural,
      repository,
      dataSource,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
    } = await this.getRepositoryAndMetadataOrFail(request);

    const { records, isForwardPagination, hasMoreRecords, totalCount } =
      await this.getRecords({
        request,
        recordId,
        repository,
        dataSource,
        objectMetadata,
        objectMetadataNameSingular,
        objectMetadataItemWithFieldsMaps,
      });

    if (recordId) {
      const record = records?.[0];

      if (!isDefined(record)) {
        throw new BadRequestException('Record not found');
      }

      return this.formatResult({
        operation: 'findOne',
        objectNameSingular: objectMetadataNameSingular,
        data: record,
      });
    } else {
      return this.formatPaginatedResult(
        records,
        objectMetadataNamePlural,
        isForwardPagination,
        hasMoreRecords,
        totalCount,
      );
    }
  }

  private async getRecords({
    request,
    recordId,
    repository,
    dataSource,
    objectMetadata,
    objectMetadataNameSingular,
    objectMetadataItemWithFieldsMaps,
  }: {
    request: Request;
    recordId: string | undefined;
    repository: WorkspaceRepository<ObjectLiteral>;
    dataSource: WorkspaceDataSource;
    objectMetadata: any;
    objectMetadataNameSingular: string;
    objectMetadataItemWithFieldsMaps:
      | ObjectMetadataItemWithFieldMaps
      | undefined;
  }) {
    const qb = repository.createQueryBuilder(objectMetadataNameSingular);

    const inputs = this.getVariablesFactory.create(
      recordId,
      request,
      objectMetadata,
    );

    const fieldMetadataMapByName =
      objectMetadataItemWithFieldsMaps?.fieldsByName || {};
    const fieldMetadataMapByJoinColumnName =
      objectMetadataItemWithFieldsMaps?.fieldsByJoinColumnName || {};

    const graphqlQueryParser = new GraphqlQueryParser(
      fieldMetadataMapByName,
      fieldMetadataMapByJoinColumnName,
      objectMetadata.objectMetadataMaps,
      dataSource.featureFlagMap,
    );

    const filters = this.computeFilters(inputs);

    let selectQueryBuilder = isDefined(filters)
      ? graphqlQueryParser.applyFilterToBuilder(
          qb,
          objectMetadataNameSingular,
          filters,
        )
      : qb;

    const totalCount = await this.getTotalCount(selectQueryBuilder);

    selectQueryBuilder = isDefined(inputs.orderBy)
      ? graphqlQueryParser.applyOrderToBuilder(
          selectQueryBuilder,
          inputs.orderBy as ObjectRecordOrderBy,
          objectMetadataNameSingular,
        )
      : selectQueryBuilder;

    selectQueryBuilder = inputs.limit
      ? graphqlQueryParser.applyLimitToBuilder(selectQueryBuilder, inputs.limit)
      : selectQueryBuilder;

    const recordIds = await selectQueryBuilder
      .select(`${objectMetadataNameSingular}.id`)
      .getMany();

    const relations = this.getRelations({
      objectMetadata: objectMetadata.objectMetadataMapItem,
      depth: inputs.depth,
    });

    const records = await repository.find({
      where: { id: In(recordIds.map((record) => record.id)) },
      relations,
    });

    const hasMoreRecords = records.length < totalCount;

    const isForwardPagination = !inputs.endingBefore;

    return {
      records: formatGetManyData<ObjectLiteral[]>(
        records,
        objectMetadataItemWithFieldsMaps as any,
        objectMetadata.objectMetadataMaps,
        dataSource.featureFlagMap[FeatureFlagKey.IsNewRelationEnabled],
      ),
      totalCount,
      hasMoreRecords,
      isForwardPagination,
    };
  }

  private getRelations({
    objectMetadata,
    depth,
  }: {
    objectMetadata: ObjectMetadataInterface;
    depth: Depth | undefined;
  }) {
    if (!isDefined(depth) || depth === 0) {
      return [];
    }

    const relations: string[] = [];

    objectMetadata.fields.forEach((field) => {
      if (field.type === FieldMetadataType.RELATION) {
        relations.push(`${field.name}`);
      }
    });

    return relations;
  }

  private computeFilters(inputs: QueryVariables) {
    let appliedFilters = inputs.filter;

    if (inputs.startingAfter) {
      appliedFilters = {
        and: [
          appliedFilters || {},
          { id: { gt: this.parseCursor(inputs.startingAfter).id } },
        ],
      };
    }

    if (inputs.endingBefore) {
      appliedFilters = {
        and: [
          appliedFilters || {},
          { id: { lt: this.parseCursor(inputs.endingBefore).id } },
        ],
      };
    }

    return appliedFilters;
  }

  private parseCursor = (cursor: string) => {
    try {
      return JSON.parse(Buffer.from(cursor ?? '', 'base64').toString());
    } catch (error) {
      throw new BadRequestException(`Invalid cursor: ${cursor}`);
    }
  };

  private async getTotalCount(
    query: SelectQueryBuilder<ObjectLiteral>,
  ): Promise<number> {
    const countQuery = query.clone();

    return await countQuery.getCount();
  }

  private formatPaginatedResult(
    finalRecords: any[],
    objectMetadataNamePlural: string,
    isForwardPagination: boolean,
    hasMoreRecords: boolean,
    totalCount: number,
  ) {
    const hasPreviousPage = !isForwardPagination && hasMoreRecords;

    return this.formatResult({
      operation: 'findMany',
      objectNamePlural: objectMetadataNamePlural,
      data: finalRecords,
      pageInfo: {
        hasNextPage: isForwardPagination && hasMoreRecords,
        ...(hasPreviousPage ? { hasPreviousPage } : {}),
        startCursor:
          finalRecords.length > 0
            ? Buffer.from(JSON.stringify({ id: finalRecords[0].id })).toString(
                'base64',
              )
            : null,
        endCursor:
          finalRecords.length > 0
            ? Buffer.from(
                JSON.stringify({
                  id: finalRecords[finalRecords.length - 1].id,
                }),
              ).toString('base64')
            : null,
      },
      totalCount,
    });
  }

  private formatResult<T>({
    operation,
    objectNameSingular,
    objectNamePlural,
    data,
    pageInfo,
    totalCount,
  }: FormatResultParams<T>) {
    let prefix: string;

    if (operation === 'findOne') {
      prefix = objectNameSingular || '';
    } else if (operation === 'findMany') {
      prefix = objectNamePlural || '';
    } else {
      prefix = operation + capitalize(objectNameSingular || '');
    }

    return {
      data: {
        [prefix]: data,
      },
      ...(isDefined(pageInfo) ? { pageInfo } : {}),
      ...(isDefined(totalCount) ? { totalCount } : {}),
    };
  }

  private async getRepositoryAndMetadataOrFail(request: Request) {
    const { workspace, apiKey, userWorkspaceId } = request;
    const { object: parsedObject } = parseCorePath(request);

    const objectMetadata = await this.coreQueryBuilderFactory.getObjectMetadata(
      request,
      parsedObject,
    );

    if (!objectMetadata) {
      throw new BadRequestException('Object metadata not found');
    }

    if (!workspace?.id) {
      throw new BadRequestException('Workspace not found');
    }

    const dataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace(workspace.id);

    const objectMetadataNameSingular =
      objectMetadata.objectMetadataMapItem.nameSingular;

    const objectMetadataItemWithFieldsMaps =
      getObjectMetadataMapItemByNameSingular(
        objectMetadata.objectMetadataMaps,
        objectMetadataNameSingular,
      );

    const shouldBypassPermissionChecks = !!apiKey;

    const roleId =
      await this.workspacePermissionsCacheService.getRoleIdFromUserWorkspaceId({
        workspaceId: workspace.id,
        userWorkspaceId,
      });

    const repository = dataSource.getRepository<ObjectRecord>(
      objectMetadataNameSingular,
      shouldBypassPermissionChecks,
      roleId,
    );

    return {
      objectMetadataNameSingular,
      objectMetadataNamePlural: objectMetadata.objectMetadataMapItem.namePlural,
      objectMetadata,
      repository,
      dataSource,
      objectMetadataItemWithFieldsMaps,
    };
  }

  private getAuthContextFromRequest(request: Request): AuthContext {
    return {
      user: request.user,
      workspace: request.workspace,
      apiKey: request.apiKey,
      workspaceMemberId: request.workspaceMemberId,
      userWorkspaceId: request.userWorkspaceId,
    };
  }
}
