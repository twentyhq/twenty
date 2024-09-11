import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import graphqlFields from 'graphql-fields';
import { FindManyOptions, ObjectLiteral } from 'typeorm';

import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import {
  FindManyResolverArgs,
  FindOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionMapper } from 'src/engine/api/graphql/graphql-query-runner/orm-mappers/object-records-to-graphql-connection.mapper';
import { applyRangeFilter } from 'src/engine/api/graphql/graphql-query-runner/utils/apply-range-filter.util';
import { convertObjectMetadataToMap } from 'src/engine/api/graphql/graphql-query-runner/utils/convert-object-metadata-to-map.util';
import { decodeCursor } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { LogExecutionTime } from 'src/engine/decorators/observability/log-execution-time.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class GraphqlQueryRunnerService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @LogExecutionTime()
  async findOne<
    ObjectRecord extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: FindOneResolverArgs<Filter>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord | undefined> {
    const { authContext, objectMetadataItem, info, objectMetadataCollection } =
      options;
    const repository = await this.getRepository(
      authContext.workspace.id,
      objectMetadataItem.nameSingular,
    );
    const objectMetadataMap = convertObjectMetadataToMap(
      objectMetadataCollection,
    );
    const objectMetadata = this.getObjectMetadata(
      objectMetadataMap,
      objectMetadataItem.nameSingular,
    );
    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadata.fields,
      objectMetadataMap,
    );

    const { select, relations } = graphqlQueryParser.parseSelectedFields(
      objectMetadataItem,
      graphqlFields(info),
    );
    const where = graphqlQueryParser.parseFilter(args.filter ?? ({} as Filter));

    const objectRecord = await repository.findOne({ where, select, relations });

    if (!objectRecord) {
      throw new GraphqlQueryRunnerException(
        'Record not found',
        GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionMapper(objectMetadataMap);

    return typeORMObjectRecordsParser.processRecord(
      objectRecord,
      objectMetadataItem.nameSingular,
      1,
      1,
    ) as ObjectRecord;
  }

  @LogExecutionTime()
  async findMany<
    ObjectRecord extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
    OrderBy extends RecordOrderBy = RecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<ObjectRecord>> {
    const { authContext, objectMetadataItem, info, objectMetadataCollection } =
      options;

    this.validateArgsOrThrow(args);

    const repository = await this.getRepository(
      authContext.workspace.id,
      objectMetadataItem.nameSingular,
    );
    const objectMetadataMap = convertObjectMetadataToMap(
      objectMetadataCollection,
    );
    const objectMetadata = this.getObjectMetadata(
      objectMetadataMap,
      objectMetadataItem.nameSingular,
    );
    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadata.fields,
      objectMetadataMap,
    );

    const { select, relations } = graphqlQueryParser.parseSelectedFields(
      objectMetadataItem,
      graphqlFields(info),
    );
    const isForwardPagination = !isDefined(args.before);
    const order = graphqlQueryParser.parseOrder(
      args.orderBy ?? [],
      isForwardPagination,
    );
    const where = graphqlQueryParser.parseFilter(
      args.filter ?? ({} as Filter),
      true,
    );

    const cursor = this.getCursor(args);
    const limit = this.getLimit(args);

    this.addOrderByColumnsToSelect(order, select);

    const findOptions: FindManyOptions<ObjectLiteral> = {
      where,
      order,
      select,
      relations,
      take: limit + 1,
    };
    const totalCount = await repository.count({ where });

    if (cursor) {
      applyRangeFilter(where, cursor, isForwardPagination);
    }

    const objectRecords = await repository.find(findOptions);
    const { hasNextPage, hasPreviousPage } = this.getPaginationInfo(
      objectRecords,
      limit,
      isForwardPagination,
    );

    if (objectRecords.length > limit) {
      objectRecords.pop();
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionMapper(objectMetadataMap);

    return typeORMObjectRecordsParser.createConnection(
      objectRecords as ObjectRecord[],
      objectMetadataItem.nameSingular,
      limit,
      totalCount,
      order,
      hasNextPage,
      hasPreviousPage,
    );
  }

  private async getRepository(workspaceId: string, objectName: string) {
    return this.twentyORMGlobalManager.getRepositoryForWorkspace(
      workspaceId,
      objectName,
    );
  }

  private getObjectMetadata(
    objectMetadataMap: Record<string, any>,
    objectName: string,
  ) {
    const objectMetadata = objectMetadataMap[objectName];

    if (!objectMetadata) {
      throw new GraphqlQueryRunnerException(
        `Object metadata not found for ${objectName}`,
        GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    return objectMetadata;
  }

  private getCursor(
    args: FindManyResolverArgs<any, any>,
  ): Record<string, any> | undefined {
    if (args.after) return decodeCursor(args.after);
    if (args.before) return decodeCursor(args.before);

    return undefined;
  }

  private getLimit(args: FindManyResolverArgs<any, any>): number {
    return args.first ?? args.last ?? QUERY_MAX_RECORDS;
  }

  private addOrderByColumnsToSelect(
    order: Record<string, any>,
    select: Record<string, boolean>,
  ) {
    for (const column of Object.keys(order || {})) {
      if (!select[column]) {
        select[column] = true;
      }
    }
  }

  private getPaginationInfo(
    objectRecords: any[],
    limit: number,
    isForwardPagination: boolean,
  ) {
    const hasMoreRecords = objectRecords.length > limit;

    return {
      hasNextPage: isForwardPagination && hasMoreRecords,
      hasPreviousPage: !isForwardPagination && hasMoreRecords,
    };
  }

  private validateArgsOrThrow(args: FindManyResolverArgs<any, any>) {
    if (args.first && args.last) {
      throw new GraphqlQueryRunnerException(
        'Cannot provide both first and last',
        GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT,
      );
    }
    if (args.before && args.after) {
      throw new GraphqlQueryRunnerException(
        'Cannot provide both before and after',
        GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT,
      );
    }
    if (args.before && args.first) {
      throw new GraphqlQueryRunnerException(
        'Cannot provide both before and first',
        GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT,
      );
    }
    if (args.after && args.last) {
      throw new GraphqlQueryRunnerException(
        'Cannot provide both after and last',
        GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT,
      );
    }
    if (args.first !== undefined && args.first < 0) {
      throw new GraphqlQueryRunnerException(
        'First argument must be non-negative',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
    if (args.last !== undefined && args.last < 0) {
      throw new GraphqlQueryRunnerException(
        'Last argument must be non-negative',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
  }
}
