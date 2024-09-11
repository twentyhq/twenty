import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';

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
  SearchResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionMapper } from 'src/engine/api/graphql/graphql-query-runner/orm-mappers/object-records-to-graphql-connection.mapper';
import { GraphqlQueryFindManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-many-resolver.service';
import { GraphqlQueryFindOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-one-resolver.service';
import { convertObjectMetadataToMap } from 'src/engine/api/graphql/graphql-query-runner/utils/convert-object-metadata-to-map.util';
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
    const graphqlQueryFindOneResolverService =
      new GraphqlQueryFindOneResolverService(this.twentyORMGlobalManager);

    return graphqlQueryFindOneResolverService.findOne(args, options);
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
    const graphqlQueryFindManyResolverService =
      new GraphqlQueryFindManyResolverService(this.twentyORMGlobalManager);

    return graphqlQueryFindManyResolverService.findMany(args, options);
  }

  async search<ObjectRecord extends IRecord = IRecord>(
    args: SearchResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<ObjectRecord>> {
    const { authContext, objectMetadataItem, objectMetadataCollection, info } =
      options;

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        objectMetadataItem.nameSingular,
      );

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

    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadata.fields,
      objectMetadataMap,
    );

    if (!args.searchInput) {
      return {} as IConnection<ObjectRecord>;
    }
    const searchTerms = this.formatSearchTerms(args.searchInput);

    const { select } = graphqlQueryParser.parseSelectedFields(
      objectMetadataItem,
      graphqlFields(info),
    );

    const columnsToSelect = this.formatSelectedColumns(select);

    const resultsWithTsVector = await repository
      .createQueryBuilder()
      .select(columnsToSelect) // TODO do not stop relations
      .where('search_vector @@ to_tsquery(:searchTerms)', {
        searchTerms,
      })
      .orderBy('ts_rank(search_vector, to_tsquery(:searchTerms))', 'DESC')
      .setParameter('searchTerms', searchTerms)
      .execute();

    const objectRecords = await repository.formatResult(resultsWithTsVector);
    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionMapper(objectMetadataMap);

    const limit = QUERY_MAX_RECORDS; // TODO: make it an arg
    const where = {};
    const totalCount = await repository.count({
      where,
    });
    const order = undefined;
    const { hasNextPage, hasPreviousPage } = this.getPaginationInfo(
      objectRecords,
      limit,
    );

    return typeORMObjectRecordsParser.createConnection(
      objectRecords ?? [],
      objectMetadataItem.nameSingular,
      limit,
      totalCount,
      order,
      hasNextPage,
      hasPreviousPage,
    );
  }

  private formatSearchTerms(searchTerm: string) {
    const words = searchTerm.trim().split(/\s+/);
    const formattedWords = words.map((word) => `${word}:*`);

    return formattedWords.join(' | '); // TODO: also do that for emails?
  }

  private formatSelectedColumns(obj: Record<string, any>) {
    return Object.entries(obj)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => `"${key}"`)
      .join(', ');
  }

  private getPaginationInfo(
    // CCed from find many resolver
    objectRecords: any[],
    limit: number,
  ) {
    const hasMoreRecords = objectRecords.length > limit;

    return {
      hasNextPage: hasMoreRecords,
      hasPreviousPage: false, // TODO
    };
  }
}
