import { BadRequestException, Inject } from '@nestjs/common';

import { Request } from 'express';
import chunk from 'lodash.chunk';
import isEmpty from 'lodash.isempty';
import { FieldMetadataType, RestrictedFields } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { In, ObjectLiteral } from 'typeorm';

import {
  ObjectRecord,
  ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { encodeCursor } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { GetVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/get-variables.factory';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { QueryVariables } from 'src/engine/api/rest/core/types/query-variables.type';
import {
  Depth,
  DepthInputFactory,
  MAX_DEPTH,
} from 'src/engine/api/rest/input-factories/depth-input.factory';
import { computeCursorArgFilter } from 'src/engine/api/utils/compute-cursor-arg-filter.utils';
import { getAllSelectableFields } from 'src/engine/api/utils/get-all-selectable-fields.utils';
import { CreatedByFromAuthContextService } from 'src/engine/core-modules/actor/services/created-by-from-auth-context.service';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { formatResult as formatGetManyData } from 'src/engine/twenty-orm/utils/format-result.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

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
  protected readonly twentyORMManager: TwentyORMManager;
  @Inject()
  protected readonly getVariablesFactory: GetVariablesFactory;
  @Inject()
  protected readonly depthInputFactory: DepthInputFactory;
  @Inject()
  protected readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService;
  @Inject()
  protected readonly createdByFromAuthContextService: CreatedByFromAuthContextService;
  @Inject()
  protected readonly featureFlagService: FeatureFlagService;
  @Inject()
  protected readonly apiKeyRoleService: ApiKeyRoleService;

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

    const workspaceDataSource = await this.twentyORMManager.getDatasource();

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

    let roleId: string | undefined = undefined;
    let shouldBypassPermissionChecks = false;

    if (isDefined(apiKey)) {
      const isApiKeyRolesEnabled =
        await this.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IS_API_KEY_ROLES_ENABLED,
          workspace.id,
        );

      if (!isApiKeyRolesEnabled) {
        shouldBypassPermissionChecks = true;
      } else {
        roleId = await this.apiKeyRoleService.getRoleIdForApiKey(
          apiKey.id,
          workspace.id,
        );
      }
    }

    if (isDefined(userWorkspaceId)) {
      roleId =
        await this.workspacePermissionsCacheService.getRoleIdFromUserWorkspaceId(
          {
            workspaceId: workspace.id,
            userWorkspaceId,
          },
        );

      if (!roleId) {
        throw new PermissionsException(
          PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
          PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        );
      }
    }

    if (!isDefined(apiKey) && !isDefined(userWorkspaceId)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.NO_AUTHENTICATION_CONTEXT,
        PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
      );
    }

    const repository = workspaceDataSource.getRepository<ObjectRecord>(
      objectMetadataNameSingular,
      shouldBypassPermissionChecks,
      roleId,
    );

    let restrictedFields: RestrictedFields = {};

    if (
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_FIELDS_PERMISSIONS_ENABLED,
        workspace.id,
      )
    ) {
      if (roleId) {
        const objectMetadataPermissions =
          await this.workspacePermissionsCacheService.getObjectRecordPermissionsForRoles(
            {
              workspaceId: workspace.id,
              roleIds: roleId ? [roleId] : undefined,
            },
          );

        if (
          !isDefined(
            objectMetadataPermissions?.[roleId]?.[
              objectMetadata.objectMetadataMapItem.id
            ]?.restrictedFields,
          )
        ) {
          throw new InternalServerError(
            'Fields permissions not found for role',
          );
        }

        restrictedFields =
          objectMetadataPermissions[roleId][
            objectMetadata.objectMetadataMapItem.id
          ].restrictedFields;
      }
    }

    return {
      objectMetadata,
      repository,
      workspaceDataSource,
      objectMetadataItemWithFieldsMaps,
      restrictedFields,
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

    Object.values(objectMetadata.objectMetadataMapItem.fieldsById).forEach(
      (field) => {
        if (isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION)) {
          if (
            depth === MAX_DEPTH &&
            isDefined(field.relationTargetObjectMetadataId)
          ) {
            const relationTargetObjectMetadata =
              objectMetadata.objectMetadataMaps.byId[
                field.relationTargetObjectMetadataId
              ];

            if (!isDefined(relationTargetObjectMetadata)) {
              throw new BadRequestException(
                `Object metadata relation target not found for relation creation payload`,
              );
            }
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
      },
    );

    return relations;
  }

  async getRecord({
    recordIds,
    repository,
    objectMetadata,
    depth,
    restrictedFields,
  }: {
    recordIds: string[];
    repository: WorkspaceRepository<ObjectLiteral>;
    objectMetadata: {
      objectMetadataMaps: ObjectMetadataMaps;
      objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    };
    depth: Depth | undefined;
    restrictedFields: RestrictedFields;
  }) {
    const relations = this.getRelations({
      objectMetadata,
      depth: depth,
    });

    const relationsChunk = chunk(relations, 50);

    let selectOptions = undefined;

    if (!isEmpty(restrictedFields)) {
      selectOptions = getAllSelectableFields({
        restrictedFields,
        objectMetadata,
      });
    }

    const recordsWithoutRelations = await repository.find({
      ...(selectOptions && { select: selectOptions }),
      where: { id: In(recordIds) },
    });

    const recordsMap = new Map(
      recordsWithoutRelations.map((record) => [record.id, record]),
    );

    for (const relationChunk of relationsChunk) {
      const records = await repository.find({
        ...(selectOptions && { select: selectOptions }),
        where: { id: In(recordIds) },
        relations: relationChunk,
      });

      records.map((record) => {
        recordsMap.set(record.id, {
          ...recordsMap.get(record.id),
          ...record,
        });
      });
    }

    const orderedRecords = recordIds.map((id) => recordsMap.get(id));

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
    restrictedFields,
  }: {
    request: Request;
    recordId?: string;
    repository: WorkspaceRepository<ObjectLiteral>;
    objectMetadata: {
      objectMetadataMaps: ObjectMetadataMaps;
      objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    };
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps;
    extraFilters?: Partial<ObjectRecordFilter>;
    restrictedFields: RestrictedFields;
  }) {
    const objectMetadataNameSingular =
      objectMetadata.objectMetadataMapItem.nameSingular;

    const qb = repository
      .createQueryBuilder(objectMetadataNameSingular)
      .select('id');

    const inputs = this.getVariablesFactory.create(
      recordId,
      request,
      objectMetadata,
    );

    const isForwardPagination = !inputs.endingBefore;

    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldsMaps,
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
      restrictedFields,
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
    query: WorkspaceSelectQueryBuilder<ObjectLiteral>,
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
        objectMetadata.objectMetadataMapItem,
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
