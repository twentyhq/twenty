import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { ObjectLiteral, OrderByCondition, SelectQueryBuilder } from 'typeorm';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GraphqlQueryFilterConditionParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-condition.parser';
import { GraphqlQueryOrderFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { FieldValue } from 'src/engine/api/rest/core/types/field-value.type';
import { EndingBeforeInputFactory } from 'src/engine/api/rest/input-factories/ending-before-input.factory';
import { FilterInputFactory } from 'src/engine/api/rest/input-factories/filter-input.factory';
import { LimitInputFactory } from 'src/engine/api/rest/input-factories/limit-input.factory';
import { OrderByInputFactory } from 'src/engine/api/rest/input-factories/order-by-input.factory';
import { StartingAfterInputFactory } from 'src/engine/api/rest/input-factories/starting-after-input.factory';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { formatResult as formatGetManyData } from 'src/engine/twenty-orm/utils/format-result.util';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { ApiEventEmitterService } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { DepthInputFactory } from 'src/engine/api/rest/input-factories/depth-input.factory';

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
    private readonly depthInputFactory: DepthInputFactory,
    private readonly limitInputFactory: LimitInputFactory,
    private readonly filterInputFactory: FilterInputFactory,
    private readonly orderByInputFactory: OrderByInputFactory,
    private readonly startingAfterInputFactory: StartingAfterInputFactory,
    private readonly endingBeforeInputFactory: EndingBeforeInputFactory,
    private readonly recordInputTransformerService: RecordInputTransformerService,
    protected readonly apiEventEmitterService: ApiEventEmitterService,
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
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
    } = await this.getRepositoryAndMetadataOrFail(request);

    if (recordId) {
      return await this.findOne(
        repository,
        recordId,
        objectMetadataNameSingular,
      );
    } else {
      return await this.findMany(
        request,
        repository,
        objectMetadata,
        objectMetadataNameSingular,
        objectMetadataNamePlural,
        objectMetadataItemWithFieldsMaps,
      );
    }
  }

  private async findOne(
    repository: WorkspaceRepository<ObjectRecord>,
    recordId: string,
    objectMetadataNameSingular: string,
  ) {
    const record = await repository.findOne({
      where: { id: recordId },
    });

    return this.formatResult({
      operation: 'findOne',
      objectNameSingular: objectMetadataNameSingular,
      data: record,
    });
  }

  private async findMany(
    request: Request,
    repository: WorkspaceRepository<ObjectLiteral>,
    objectMetadata: any,
    objectMetadataNameSingular: string,
    objectMetadataNamePlural: string,
    objectMetadataItemWithFieldsMaps:
      | ObjectMetadataItemWithFieldMaps
      | undefined,
  ) {
    // Get input parameters
    const inputs = this.getInputs(request, objectMetadata);

    repository.find({ where: inputs.filter });

    // Create query builder
    const qb = repository.createQueryBuilder(objectMetadataNameSingular);

    // Get total count
    const totalCount = await this.getTotalCount(qb);

    // Apply filters with cursor
    const { finalQuery } = await this.applyFiltersWithCursor(
      qb,
      objectMetadataNameSingular,
      objectMetadataItemWithFieldsMaps,
      inputs,
    );

    // Get records with pagination
    const { finalRecords, hasMoreRecords } =
      await this.getRecordsWithPagination(
        finalQuery,
        objectMetadataNameSingular,
        objectMetadataItemWithFieldsMaps,
        inputs,
      );

    // Format and return result
    return this.formatPaginatedResult(
      finalRecords,
      objectMetadataNamePlural,
      objectMetadataItemWithFieldsMaps,
      objectMetadata,
      inputs.isForwardPagination,
      hasMoreRecords,
      totalCount,
    );
  }

  private getInputs(request: Request, objectMetadata: any) {
    const depth = this.depthInputFactory.create(request);
    const limit = this.limitInputFactory.create(request);
    const filter = this.filterInputFactory.create(request, objectMetadata);
    const orderBy = this.orderByInputFactory.create(request, objectMetadata);
    const endingBefore = this.endingBeforeInputFactory.create(request);
    const startingAfter = this.startingAfterInputFactory.create(request);
    const isForwardPagination = !endingBefore;

    return {
      depth,
      limit,
      filter,
      orderBy,
      endingBefore,
      startingAfter,
      isForwardPagination,
    };
  }

  private async applyFiltersWithCursor(
    qb: SelectQueryBuilder<ObjectLiteral>,
    objectMetadataNameSingular: string,
    objectMetadataItemWithFieldsMaps:
      | ObjectMetadataItemWithFieldMaps
      | undefined,
    inputs: {
      filter: Record<string, FieldValue>;
      orderBy: any;
      startingAfter: string | undefined;
      endingBefore: string | undefined;
      depth: number;
      isForwardPagination: boolean;
    },
  ) {
    const fieldMetadataMapByName =
      objectMetadataItemWithFieldsMaps?.fieldsByName || {};

    let appliedFilters = inputs.filter;

    // Handle cursor-based filtering
    if (inputs.startingAfter || inputs.endingBefore) {
      const cursor = inputs.startingAfter || inputs.endingBefore;

      try {
        const cursorData = JSON.parse(
          Buffer.from(cursor ?? '', 'base64').toString(),
        );

        // We always include ID in the ordering to ensure consistent pagination results
        // Even if two records have identical values for the user-specified sort fields, their IDs ensures a deterministic order
        const orderByWithIdCondition = [
          ...(inputs.orderBy || []),
          { id: 'ASC' },
        ];

        const cursorFilter = await this.computeCursorFilter(
          cursorData,
          orderByWithIdCondition,
          fieldMetadataMapByName,
          inputs.isForwardPagination,
        );

        // Combine cursor filter with any user-provided filters
        appliedFilters = inputs.filter
          ? { and: [inputs.filter, cursorFilter] }
          : cursorFilter;
      } catch (error) {
        throw new BadRequestException(`Invalid cursor: ${cursor}`);
      }
    }

    // Apply filters to query builder
    const finalQuery = new GraphqlQueryFilterConditionParser(
      fieldMetadataMapByName,
    ).parse(qb, objectMetadataNameSingular, appliedFilters);

    return { finalQuery, appliedFilters };
  }

  private async getTotalCount(
    query: SelectQueryBuilder<ObjectLiteral>,
  ): Promise<number> {
    // Clone the query to avoid modifying the original query that will fetch records
    const countQuery = query.clone();

    return await countQuery.getCount();
  }

  private async getRecordsWithPagination(
    query: SelectQueryBuilder<ObjectLiteral>,
    objectMetadataNameSingular: string,
    objectMetadataItemWithFieldsMaps:
      | ObjectMetadataItemWithFieldMaps
      | undefined,
    inputs: {
      orderBy: any;
      limit: number;
      isForwardPagination: boolean;
      depth: number;
    },
  ) {
    const fieldMetadataMapByName =
      objectMetadataItemWithFieldsMaps?.fieldsByName || {};

    // Get parsed order by
    const parsedOrderBy = new GraphqlQueryOrderFieldParser(
      fieldMetadataMapByName,
    ).parse(inputs.orderBy, objectMetadataNameSingular);

    // For backward pagination (endingBefore), we need to reverse the sort order
    const finalOrderBy = inputs.isForwardPagination
      ? parsedOrderBy
      : Object.entries(parsedOrderBy).reduce((acc, [key, direction]) => {
          acc[key] = direction === 'ASC' ? 'DESC' : 'ASC';

          return acc;
        }, {});

    // Fetch one extra record beyond the requested limit
    // We'll remove it from the results before returning to the client
    const records = await query
      .orderBy(finalOrderBy as OrderByCondition)
      .take(inputs.limit + 1)
      .getMany();

    // If we got more records than the limit, it means there are more pages
    const hasMoreRecords = records.length > inputs.limit;

    // Remove the extra record if we fetched more than requested
    if (hasMoreRecords) {
      records.pop();
    }

    // For backward pagination, we reversed the order to get the correct records
    // Now we need to reverse them back to maintain the expected order for the client
    const finalRecords = !inputs.isForwardPagination
      ? records.reverse()
      : records;

    return { finalRecords, hasMoreRecords };
  }

  private formatPaginatedResult(
    finalRecords: any[],
    objectMetadataNamePlural: string,
    objectMetadataItemWithFieldsMaps: any,
    objectMetadata: any,
    isForwardPagination: boolean,
    hasMoreRecords: boolean,
    totalCount: number,
  ) {
    const hasPreviousPage = !isForwardPagination && hasMoreRecords;

    return this.formatResult({
      operation: 'findMany',
      objectNamePlural: objectMetadataNamePlural,
      data: formatGetManyData(
        finalRecords,
        objectMetadataItemWithFieldsMaps as any,
        objectMetadata.objectMetadataMaps,
      ),
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
    const { workspace } = request;
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

    const objectMetadataNameSingular =
      objectMetadata.objectMetadataMapItem.nameSingular;

    const objectMetadataItemWithFieldsMaps =
      getObjectMetadataMapItemByNameSingular(
        objectMetadata.objectMetadataMaps,
        objectMetadataNameSingular,
      );

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ObjectRecord>(
        workspace.id,
        objectMetadataNameSingular,
      );

    return {
      objectMetadataNameSingular,
      objectMetadataNamePlural: objectMetadata.objectMetadataMapItem.namePlural,
      objectMetadata,
      repository,
      objectMetadataItemWithFieldsMaps,
    };
  }

  // Helper method to compute cursor filter
  private async computeCursorFilter(
    cursorData: Record<string, any>,
    orderByWithIdCondition: any[],
    fieldMetadataMapByName: FieldMetadataMap,
    isForwardPagination: boolean,
  ): Promise<any> {
    return {
      id: isForwardPagination ? { gt: cursorData.id } : { lt: cursorData.id },
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
