import { BadRequestException, Inject } from '@nestjs/common';

import { Request } from 'express';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { In, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import {
  ObjectRecord,
  ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ApiEventEmitterService } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { GetVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/get-variables.factory';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { QueryVariables } from 'src/engine/api/rest/core/types/query-variables.type';
import {
  Depth,
  DepthInputFactory,
  MAX_DEPTH,
} from 'src/engine/api/rest/input-factories/depth-input.factory';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { formatResult as formatGetManyData } from 'src/engine/twenty-orm/utils/format-result.util';
import { encodeCursor } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { computeCursorArgFilter } from 'src/engine/api/utils/compute-cursor-arg-filter.utils';
import { CreatedByFromAuthContextService } from 'src/engine/core-modules/actor/services/created-by-from-auth-context.service';

export interface PageInfo {
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

interface FormatResultParams<T> {
  operation:
    | 'delete'
    | 'create'
    | 'update'
    | 'findOne'
    | 'findMany'
    | 'findDuplicates';
  objectNameSingular?: string;
  objectNamePlural?: string;
  data: T;
  pageInfo?: PageInfo;
  totalCount?: number;
}

export interface FormatResult {
  data?: {
    [operation: string]: object;
  };
  pageInfo?: PageInfo;
  totalCount?: number;
}

export abstract class RestApiBaseHandler {
  @Inject()
  protected readonly recordInputTransformerService: RecordInputTransformerService;
  @Inject()
  protected readonly coreQueryBuilderFactory: CoreQueryBuilderFactory;
  @Inject()
  protected readonly twentyORMGlobalManager: TwentyORMGlobalManager;
  @Inject()
  protected readonly getVariablesFactory: GetVariablesFactory;
  @Inject()
  protected readonly depthInputFactory: DepthInputFactory;
  @Inject()
  protected readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService;
  @Inject()
  protected readonly apiEventEmitterService: ApiEventEmitterService;
  @Inject()
  protected readonly createdByFromAuthContextService: CreatedByFromAuthContextService;

  protected abstract handle(
    request: Request,
  ): Promise<FormatResult | { data: FormatResult[] }>;

  public async getRepositoryAndMetadataOrFail(request: Request) {
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
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId: workspace.id,
        shouldFailIfMetadataNotFound: false,
      });

    const objectMetadataNameSingular =
      objectMetadata.objectMetadataMapItem.nameSingular;

    const objectMetadataItemWithFieldsMaps =
      getObjectMetadataMapItemByNameSingular(
        objectMetadata.objectMetadataMaps,
        objectMetadataNameSingular,
      );

    if (!isDefined(objectMetadataItemWithFieldsMaps)) {
      throw new BadRequestException(
        `Object metadata item with name singular ${objectMetadataNameSingular} not found`,
      );
    }

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
      objectMetadata,
      repository,
      dataSource,
      objectMetadataItemWithFieldsMaps,
    };
  }

  getRelations({
    objectMetadata,
    depth,
  }: {
    objectMetadata: {
      objectMetadataMaps: ObjectMetadataMaps;
      objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    };
    depth: Depth | undefined;
  }) {
    if (!isDefined(depth) || depth === 0) {
      return [];
    }

    const relations: string[] = [];

    objectMetadata.objectMetadataMapItem.fields.forEach((field) => {
      if (field.type === FieldMetadataType.RELATION) {
        if (
          depth === MAX_DEPTH &&
          isDefined(field.relationTargetObjectMetadataId)
        ) {
          const relationTargetObjectMetadata =
            objectMetadata.objectMetadataMaps.byId[
              field.relationTargetObjectMetadataId
            ];
          const depth2Relations = this.getRelations({
            objectMetadata: {
              objectMetadataMaps: objectMetadata.objectMetadataMaps,
              objectMetadataMapItem: relationTargetObjectMetadata,
            },
            depth: 1,
          });

          depth2Relations.forEach((depth2Relation) => {
            relations.push(`${field.name}.${depth2Relation}`);
          });
        } else {
          relations.push(`${field.name}`);
        }
      }
    });

    return relations;
  }

  async getRecord({
    recordIds,
    repository,
    objectMetadata,
    depth,
  }: {
    recordIds: string[];
    repository: WorkspaceRepository<ObjectLiteral>;
    objectMetadata: {
      objectMetadataMaps: ObjectMetadataMaps;
      objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    };
    depth: Depth | undefined;
  }) {
    const relations = this.getRelations({
      objectMetadata,
      depth: depth,
    });

    const unorderedRecords = await repository.find({
      where: { id: In(recordIds) },
      relations,
    });

    const recordMap = new Map(unorderedRecords.map((r) => [r.id, r]));

    const orderedRecords = recordIds.map((id) => recordMap.get(id));

    return orderedRecords;
  }

  public getAuthContextFromRequest(request: Request): AuthContext {
    return {
      user: request.user,
      workspace: request.workspace,
      apiKey: request.apiKey,
      workspaceMemberId: request.workspaceMemberId,
      userWorkspaceId: request.userWorkspaceId,
    };
  }

  public formatResult<T>({
    operation,
    objectNameSingular,
    objectNamePlural,
    data,
    pageInfo,
    totalCount,
  }: FormatResultParams<T>) {
    let prefix: string;

    if (isDefined(objectNameSingular) && isDefined(objectNamePlural)) {
      throw new Error(
        'Cannot define both objectNameSingular and objectNamePlural',
      );
    }

    if (operation === 'findOne') {
      prefix = objectNameSingular || '';
    } else if (operation === 'findMany') {
      prefix = objectNamePlural || '';
    } else if (operation === 'findDuplicates') {
      prefix = `${objectNameSingular}Duplicates`;
    } else {
      prefix =
        operation + capitalize(objectNameSingular || objectNamePlural || '');
    }

    return {
      ...(operation === 'findDuplicates'
        ? {
            [prefix]: data,
          }
        : {
            data: {
              [prefix]: data,
            },
          }),
      ...(isDefined(pageInfo) ? { pageInfo } : {}),
      ...(isDefined(totalCount) ? { totalCount } : {}),
    };
  }

  async findRecords({
    request,
    recordId,
    repository,
    objectMetadata,
    objectMetadataItemWithFieldsMaps,
    extraFilters,
  }: {
    request: Request;
    recordId?: string;
    repository: WorkspaceRepository<ObjectLiteral>;
    objectMetadata: {
      objectMetadataMaps: ObjectMetadataMaps;
      objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    };
    objectMetadataItemWithFieldsMaps:
      | ObjectMetadataItemWithFieldMaps
      | undefined;
    extraFilters?: Partial<ObjectRecordFilter>;
  }) {
    const objectMetadataNameSingular =
      objectMetadata.objectMetadataMapItem.nameSingular;

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

    const isForwardPagination = !inputs.endingBefore;

    const graphqlQueryParser = new GraphqlQueryParser(
      fieldMetadataMapByName,
      fieldMetadataMapByJoinColumnName,
      objectMetadata.objectMetadataMaps,
    );

    const filters = this.computeFilters({
      inputs,
      objectMetadata,
      isForwardPagination,
      extraFilters,
    });

    let selectQueryBuilder = isDefined(filters)
      ? graphqlQueryParser.applyFilterToBuilder(
          qb,
          objectMetadataNameSingular,
          filters,
        )
      : qb;

    const totalCount = await this.getTotalCount(selectQueryBuilder);

    selectQueryBuilder = graphqlQueryParser.applyOrderToBuilder(
      selectQueryBuilder,
      inputs.orderBy || [],
      objectMetadataNameSingular,
      isForwardPagination,
    );

    if (inputs.first) {
      selectQueryBuilder = selectQueryBuilder.limit(inputs.first);
    }

    if (inputs.last) {
      selectQueryBuilder = selectQueryBuilder.limit(inputs.last);
    }

    const recordIds = await selectQueryBuilder
      .select(`${objectMetadataNameSingular}.id`)
      .getMany();

    const records = await this.getRecord({
      recordIds: recordIds.map((record) => record.id),
      repository,
      objectMetadata,
      depth: this.depthInputFactory.create(request),
    });

    const hasMoreRecords = records.length < totalCount;

    const finalRecords = formatGetManyData<ObjectRecord[]>(
      records,
      objectMetadataItemWithFieldsMaps,
      objectMetadata.objectMetadataMaps,
    );

    const startCursor =
      finalRecords.length > 0
        ? encodeCursor(finalRecords[0], inputs.orderBy)
        : null;

    const endCursor =
      finalRecords.length > 0
        ? encodeCursor(finalRecords[finalRecords.length - 1], inputs.orderBy)
        : null;

    return {
      records: finalRecords,
      totalCount,
      hasMoreRecords,
      isForwardPagination,
      startCursor,
      endCursor,
    };
  }

  async getTotalCount(
    query: SelectQueryBuilder<ObjectLiteral>,
  ): Promise<number> {
    const countQuery = query.clone();

    return await countQuery.getCount();
  }

  computeFilters({
    inputs,
    objectMetadata,
    isForwardPagination,
    extraFilters,
  }: {
    inputs: QueryVariables;
    objectMetadata: {
      objectMetadataMaps: ObjectMetadataMaps;
      objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    };
    isForwardPagination: boolean;
    extraFilters?: Partial<ObjectRecordFilter>;
  }) {
    let appliedFilters = inputs.filter;

    if (extraFilters) {
      appliedFilters = (appliedFilters
        ? { and: [appliedFilters, extraFilters] }
        : extraFilters) as unknown as ObjectRecordFilter;
    }

    const cursor = inputs.startingAfter || inputs.endingBefore;

    if (cursor) {
      const cursorArgFilter = computeCursorArgFilter(
        this.parseCursor(cursor),
        inputs.orderBy || [],
        objectMetadata.objectMetadataMapItem.fieldsByName,
        isForwardPagination,
      );

      appliedFilters = (appliedFilters
        ? {
            and: [appliedFilters, { or: cursorArgFilter }],
          }
        : { or: cursorArgFilter }) as unknown as ObjectRecordFilter;
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
}
