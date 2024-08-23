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
import {
  createConnection,
  decodeCursor,
} from 'src/engine/api/graphql/graphql-query-runner/utils/connection.util';
import { convertObjectMetadataToMap } from 'src/engine/api/graphql/graphql-query-runner/utils/convert-object-metadata-to-map.util';
import {
  applyRangeFilter,
  parseFilter,
} from 'src/engine/api/graphql/graphql-query-runner/utils/filter-parser.util';
import { parseOrder } from 'src/engine/api/graphql/graphql-query-runner/utils/order-parser.util';
import { parseSelectedFields } from 'src/engine/api/graphql/graphql-query-runner/utils/selected-field-parser.util';
import { LogExecutionTime } from 'src/engine/decorators/observability/timed.decorator';
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

    const { select, relations } = parseSelectedFields(
      objectMetadataItem,
      selectedFields,
      objectMetadataMap,
    );

    const order = args.orderBy
      ? parseOrder(args.orderBy, fieldMetadataMap)
      : undefined;

    const where = args.filter ? parseFilter(args.filter, fieldMetadataMap) : {};

    let cursor: Record<string, any> | undefined;

    if (args.after) {
      cursor = decodeCursor(args.after);
    } else if (args.before) {
      cursor = decodeCursor(args.before);
    }

    if (cursor) {
      applyRangeFilter(where, order, cursor);
    }

    const findOptions: FindManyOptions<ObjectLiteral> = {
      where,
      order,
      select,
      relations,
      take: args.first ?? args.last ?? QUERY_MAX_RECORDS,
    };

    const [items, totalCount] = await repository.findAndCount(findOptions);

    return createConnection((items as ObjectRecord[]) ?? [], totalCount, order);
  }
}
