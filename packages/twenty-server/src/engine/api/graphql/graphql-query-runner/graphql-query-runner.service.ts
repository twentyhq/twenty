import { Injectable } from '@nestjs/common';

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
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/parsers/graphql-query.parser';
import { applyRangeFilter } from 'src/engine/api/graphql/graphql-query-runner/utils/apply-range-filter.util';
import {
  createConnection,
  decodeCursor,
} from 'src/engine/api/graphql/graphql-query-runner/utils/connection.util';
import { convertObjectMetadataToMap } from 'src/engine/api/graphql/graphql-query-runner/utils/convert-object-metadata-to-map.util';
import { LogExecutionTime } from 'src/engine/decorators/observability/timed.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class GraphqlQueryRunnerService {
  private graphqlQueryParser: GraphqlQueryParser;

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
    const {
      authContext,
      objectMetadataItem,
      info,
      objectMetadataCollection,
      fieldMetadataCollection,
    } = options;

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        objectMetadataItem.nameSingular,
      );

    const selectedFields = graphqlFields(info);

    const objectMetadataMap = convertObjectMetadataToMap(
      objectMetadataCollection,
    );

    const fieldMetadataMap = new Map(
      fieldMetadataCollection.map((metadata) => [metadata.name, metadata]),
    );

    this.graphqlQueryParser = new GraphqlQueryParser(
      fieldMetadataMap,
      objectMetadataMap,
    );

    const { select, relations } = this.graphqlQueryParser.parseSelectedFields(
      objectMetadataItem,
      selectedFields,
    );

    const order = args.orderBy
      ? this.graphqlQueryParser.parseOrder(args.orderBy)
      : undefined;

    const where = args.filter
      ? this.graphqlQueryParser.parseFilter(args.filter)
      : {};

    let cursor: Record<string, any> | undefined;

    if (args.after) {
      cursor = decodeCursor(args.after);
    } else if (args.before) {
      cursor = decodeCursor(args.before);
    }

    const take = args.first ?? args.last ?? QUERY_MAX_RECORDS;

    const findOptions: FindManyOptions<ObjectLiteral> = {
      where,
      order,
      select,
      relations,
      take,
    };

    const totalCount = await repository.count({
      where,
    });

    if (cursor) {
      applyRangeFilter(where, order, cursor);
    }

    const objectRecods = await repository.find(findOptions);

    return createConnection(
      (objectRecods as ObjectRecord[]) ?? [],
      take,
      totalCount,
      order,
    );
  }
}
