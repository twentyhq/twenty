import { Injectable } from '@nestjs/common';

import { ResolverService } from 'src/engine/api/graphql/graphql-query-runner/interfaces/resolver-service.interface';
import {
  Record as IRecord,
  OrderByDirection,
  RecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { SearchResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class GraphqlQuerySearchResolverService
  implements ResolverService<SearchResolverArgs, IConnection<IRecord>>
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async resolve<
    ObjectRecord extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: SearchResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<ObjectRecord>> {
    const {
      authContext,
      objectMetadataItem,
      objectMetadataMapItem,
      objectMetadataMap,
    } = options;

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        objectMetadataItem.nameSingular,
      );

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMap);

    if (!isDefined(args.searchInput)) {
      return typeORMObjectRecordsParser.createConnection({
        objectRecords: [],
        objectName: objectMetadataItem.nameSingular,
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
      objectMetadataItem.nameSingular,
    );
    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadataMapItem.fields,
      objectMetadataMap,
    );

    const queryBuilderWithFilter = graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataMapItem.nameSingular,
      args.filter ?? ({} as Filter),
    );

    const resultsWithTsVector = (await queryBuilderWithFilter
      .andWhere(
        searchTerms === ''
          ? `"${SEARCH_VECTOR_FIELD.name}" IS NOT NULL`
          : `"${SEARCH_VECTOR_FIELD.name}" @@ to_tsquery(:searchTerms)`,
        searchTerms === '' ? {} : { searchTerms },
      )
      .orWhere(
        searchTermsOr === ''
          ? `"${SEARCH_VECTOR_FIELD.name}" IS NOT NULL`
          : `"${SEARCH_VECTOR_FIELD.name}" @@ to_tsquery(:searchTermsOr)`,
        searchTermsOr === '' ? {} : { searchTermsOr },
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

    const objectRecords = await repository.formatResult(resultsWithTsVector);

    const totalCount = await repository.count();
    const order = undefined;

    return typeORMObjectRecordsParser.createConnection({
      objectRecords: objectRecords ?? [],
      objectName: objectMetadataItem.nameSingular,
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
