import { Injectable } from '@nestjs/common';

import { Brackets } from 'typeorm';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import {
  ObjectRecord,
  ObjectRecordFilter,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { SearchResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class GraphqlQuerySearchResolverService extends GraphqlQueryBaseResolverService<
  SearchResolverArgs,
  IConnection<ObjectRecord>
> {
  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<SearchResolverArgs>,
  ): Promise<IConnection<ObjectRecord>> {
    const { authContext, objectMetadataMaps, objectMetadataItemWithFieldMaps } =
      executionArgs.options;

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    if (!isDefined(executionArgs.args.searchInput)) {
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

    const searchTerms = this.formatSearchTerms(
      executionArgs.args.searchInput,
      'and',
    );
    const searchTermsOr = this.formatSearchTerms(
      executionArgs.args.searchInput,
      'or',
    );

    const limit = executionArgs.args?.limit ?? QUERY_MAX_RECORDS;

    const queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    executionArgs.graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataItemWithFieldMaps.nameSingular,
      executionArgs.args.filter ?? ({} as ObjectRecordFilter),
    );

    const countQueryBuilder = queryBuilder.clone();

    const resultsWithTsVector = (await queryBuilder
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
      .getMany()) as ObjectRecord[];

    const objectRecords = formatResult<ObjectRecord[]>(
      resultsWithTsVector,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    const totalCount = isDefined(
      executionArgs.graphqlQuerySelectedFieldsResult.aggregate.totalCount,
    )
      ? await countQueryBuilder.getCount()
      : 0;
    const order = undefined;

    const processNestedRelationsHelper = new ProcessNestedRelationsHelper();

    if (executionArgs.graphqlQuerySelectedFieldsResult.relations) {
      await processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: objectRecords,
        relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
        aggregate: executionArgs.graphqlQuerySelectedFieldsResult.aggregate,
        limit,
        authContext,
        dataSource: executionArgs.dataSource,
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
