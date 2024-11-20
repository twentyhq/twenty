import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';
import { Brackets } from 'typeorm';

import { ResolverService } from 'src/engine/api/graphql/graphql-query-runner/interfaces/resolver-service.interface';
import {
  ObjectRecord,
  ObjectRecordFilter,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { SearchResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import { GraphqlQuerySelectedFieldsResult } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class GraphqlQuerySearchResolverService
  implements ResolverService<SearchResolverArgs, IConnection<ObjectRecord>>
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async resolve<
    T extends ObjectRecord = ObjectRecord,
    Filter extends ObjectRecordFilter = ObjectRecordFilter,
  >(
    args: SearchResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<T>> {
    const {
      authContext,
      objectMetadataMaps,
      objectMetadataItemWithFieldMaps,
      info,
    } = options;

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        objectMetadataItemWithFieldMaps.nameSingular,
      );

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    if (!isDefined(args.searchInput)) {
      return typeORMObjectRecordsParser.createConnection({
        objectRecords: [],
        objectName: objectMetadataItemWithFieldMaps.nameSingular,
        take: 0,
        totalCount: 0,
        order: [{ id: OrderByDirection.AscNullsFirst }],
        hasNextPage: false,
        hasPreviousPage: false,
      });
    }
    const searchTerms = this.formatSearchTerms(args.searchInput, 'and');
    const searchTermsOr = this.formatSearchTerms(args.searchInput, 'or');

    const limit = args?.limit ?? QUERY_MAX_RECORDS;

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );
    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldMaps.fieldsByName,
      objectMetadataMaps,
    );

    const queryBuilderWithFilter = graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataItemWithFieldMaps.nameSingular,
      args.filter ?? ({} as Filter),
    );

    const resultsWithTsVector = (await queryBuilderWithFilter
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            searchTerms === ''
              ? `"${SEARCH_VECTOR_FIELD.name}" IS NOT NULL`
              : `"${SEARCH_VECTOR_FIELD.name}" @@ to_tsquery('simple', :searchTerms)`,
            searchTerms === '' ? {} : { searchTerms },
          ).orWhere(
            searchTermsOr === ''
              ? `"${SEARCH_VECTOR_FIELD.name}" IS NOT NULL`
              : `"${SEARCH_VECTOR_FIELD.name}" @@ to_tsquery('simple', :searchTermsOr)`,
            searchTermsOr === '' ? {} : { searchTermsOr },
          );
        }),
      )
      .orderBy(
        `ts_rank_cd("${SEARCH_VECTOR_FIELD.name}", to_tsquery(:searchTerms))`,
        'DESC',
      )
      .addOrderBy(
        `ts_rank("${SEARCH_VECTOR_FIELD.name}", to_tsquery(:searchTermsOr))`,
        'DESC',
      )
      .setParameter('searchTerms', searchTerms)
      .setParameter('searchTermsOr', searchTermsOr)
      .take(limit)
      .getMany()) as T[];

    const objectRecords = await repository.formatResult(resultsWithTsVector);

    const selectedFields = graphqlFields(info);

    const graphqlQuerySelectedFieldsResult: GraphqlQuerySelectedFieldsResult =
      graphqlQueryParser.parseSelectedFields(
        objectMetadataItemWithFieldMaps,
        selectedFields,
      );

    const totalCount = isDefined(selectedFields.totalCount)
      ? await queryBuilderWithFilter.getCount()
      : 0;
    const order = undefined;

    const processNestedRelationsHelper = new ProcessNestedRelationsHelper();

    const dataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace(
        authContext.workspace.id,
      );

    if (graphqlQuerySelectedFieldsResult.relations) {
      await processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: objectRecords,
        relations: graphqlQuerySelectedFieldsResult.relations,
        aggregate: graphqlQuerySelectedFieldsResult.aggregate,
        limit,
        authContext,
        dataSource,
      });
    }

    return typeORMObjectRecordsParser.createConnection({
      objectRecords: objectRecords ?? [],
      objectName: objectMetadataItemWithFieldMaps.nameSingular,
      take: limit,
      totalCount,
      order,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  }

  private formatSearchTerms(
    searchTerm: string,
    operator: 'and' | 'or' = 'and',
  ) {
    if (searchTerm === '') {
      return '';
    }
    const words = searchTerm.trim().split(/\s+/);
    const formattedWords = words.map((word) => {
      const escapedWord = word.replace(/[\\:'&|!()]/g, '\\$&');

      return `${escapedWord}:*`;
    });

    return formattedWords.join(` ${operator === 'and' ? '&' : '|'} `);
  }

  async validate(
    _args: SearchResolverArgs,
    _options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {}
}
