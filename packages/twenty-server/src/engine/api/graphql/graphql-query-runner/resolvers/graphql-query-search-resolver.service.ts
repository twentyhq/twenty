import { Injectable } from '@nestjs/common';

import { ResolverService } from 'src/engine/api/graphql/graphql-query-runner/interfaces/resolver-service.interface';
import {
  Record as IRecord,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { SearchResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class GraphqlQuerySearchResolverService
  implements ResolverService<SearchResolverArgs, IConnection<IRecord>>
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async resolve<ObjectRecord extends IRecord = IRecord>(
    args: SearchResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<ObjectRecord>> {
    const { authContext, objectMetadataItem, objectMetadataMap } = options;

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        objectMetadataItem.nameSingular,
      );

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMap);

    if (!args.searchInput) {
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
    const searchTerms = this.formatSearchTerms(args.searchInput);

    const limit = args?.limit ?? QUERY_MAX_RECORDS;

    const resultsWithTsVector = (await repository
      .createQueryBuilder()
      .where(`"${SEARCH_VECTOR_FIELD.name}" @@ to_tsquery(:searchTerms)`, {
        searchTerms,
      })
      .orderBy(
        `ts_rank("${SEARCH_VECTOR_FIELD.name}", to_tsquery(:searchTerms))`,
        'DESC',
      )
      .setParameter('searchTerms', searchTerms)
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

  private formatSearchTerms(searchTerm: string) {
    const words = searchTerm.trim().split(/\s+/);
    const formattedWords = words.map((word) => {
      const escapedWord = word.replace(/[\\:'&|!()]/g, '\\$&');

      return `${escapedWord}:*`;
    });

    return formattedWords.join(' | ');
  }

  async validate(
    _args: SearchResolverArgs,
    _options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {}
}
