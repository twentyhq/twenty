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
import { FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

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
  async findManyWithTwentyOrm<
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

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        objectMetadataItem.nameSingular,
      );

    const selectedFields = graphqlFields(info);

    const objectMetadataMap = convertObjectMetadataToMap(
      objectMetadataCollection,
    );

    const objectMetadata = objectMetadataMap[objectMetadataItem.nameSingular];

    if (!objectMetadata) {
      throw new GraphqlQueryRunnerException(
        `Object metadata not found for ${objectMetadataItem.nameSingular}`,
        GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const fieldMetadataMap = objectMetadata.fields;

    const graphqlQueryParser = new GraphqlQueryParser(
      fieldMetadataMap,
      objectMetadataMap,
    );

    const { select, relations } = graphqlQueryParser.parseSelectedFields(
      objectMetadataItem,
      selectedFields,
    );

    const isBackwardPagination = isDefined(args.before);
    const isForwardPagination = !isBackwardPagination;

    const order = graphqlQueryParser.parseOrder(
      args.orderBy ?? [],
      isForwardPagination,
    );

    const where = graphqlQueryParser.parseFilter(args.filter ?? ({} as Filter));

    let cursor: Record<string, any> | undefined;

    if (args.after) {
      cursor = decodeCursor(args.after);
    } else if (args.before) {
      cursor = decodeCursor(args.before);
    }

    const limit = args.first ?? args.last ?? QUERY_MAX_RECORDS;

    const orderByColumnsToAddToSelect = new Set(Object.keys(order || {}));

    for (const column of orderByColumnsToAddToSelect) {
      if (!select[column]) {
        select[column] = true;
      }
    }

    const findOptions: FindManyOptions<ObjectLiteral> = {
      where,
      order,
      select,
      relations,
      take: limit + 1,
    };

    const totalCount = await repository.count({
      where,
    });

    if (cursor) {
      applyRangeFilter(where, cursor, isForwardPagination);
    }

    const objectRecords = await repository.find(findOptions);

    const hasMoreRecords = objectRecords.length > limit;

    if (hasMoreRecords) {
      objectRecords.pop();
    }

    const hasPreviousPage = isBackwardPagination && hasMoreRecords;
    const hasNextPage = isForwardPagination && hasMoreRecords;

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionMapper(objectMetadataMap);

    return typeORMObjectRecordsParser.createConnection(
      (objectRecords as ObjectRecord[]) ?? [],
      limit,
      totalCount,
      order,
      objectMetadataItem.nameSingular,
      hasNextPage,
      hasPreviousPage,
    );
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
