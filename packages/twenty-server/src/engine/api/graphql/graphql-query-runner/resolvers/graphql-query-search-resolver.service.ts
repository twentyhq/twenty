import {
  Record as IRecord,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { SearchResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ObjectRecordsToGraphqlConnectionMapper } from 'src/engine/api/graphql/graphql-query-runner/orm-mappers/object-records-to-graphql-connection.mapper';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { generateObjectMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export class GraphqlQuerySearchResolverService {
  private twentyORMGlobalManager: TwentyORMGlobalManager;
  private featureFlagService: FeatureFlagService;

  constructor(
    twentyORMGlobalManager: TwentyORMGlobalManager,
    featureFlagService: FeatureFlagService,
  ) {
    this.twentyORMGlobalManager = twentyORMGlobalManager;
    this.featureFlagService = featureFlagService;
  }

  async search<ObjectRecord extends IRecord = IRecord>(
    args: SearchResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<ObjectRecord>> {
    const { authContext, objectMetadataItem, objectMetadataCollection } =
      options;

    const featureFlagsForWorkspace =
      await this.featureFlagService.getWorkspaceFeatureFlags(
        authContext.workspace.id,
      );

    const isQueryRunnerTwentyORMEnabled =
      featureFlagsForWorkspace.IS_QUERY_RUNNER_TWENTY_ORM_ENABLED;

    const isSearchEnabled = featureFlagsForWorkspace.IS_SEARCH_ENABLED;

    if (!isQueryRunnerTwentyORMEnabled || !isSearchEnabled) {
      throw new GraphqlQueryRunnerException(
        'This endpoint is not available yet, please use findMany instead.',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        objectMetadataItem.nameSingular,
      );

    const objectMetadataMap = generateObjectMetadataMap(
      objectMetadataCollection,
    );

    const objectMetadata = objectMetadataMap[objectMetadataItem.nameSingular];

    if (!objectMetadata) {
      throw new GraphqlQueryRunnerException(
        `Object metadata not found for ${objectMetadataItem.nameSingular}`,
        GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionMapper(objectMetadataMap);

    if (!args.searchInput) {
      return typeORMObjectRecordsParser.createConnection(
        [],
        objectMetadataItem.nameSingular,
        0,
        0,
        [{ id: OrderByDirection.AscNullsFirst }],
        false,
        false,
      );
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
      .limit(limit)
      .getMany()) as ObjectRecord[];

    const objectRecords = await repository.formatResult(resultsWithTsVector);

    const totalCount = await repository.count();
    const order = undefined;

    return typeORMObjectRecordsParser.createConnection(
      objectRecords ?? [],
      objectMetadataItem.nameSingular,
      limit,
      totalCount,
      order,
      false,
      false,
    );
  }

  private formatSearchTerms(searchTerm: string) {
    const words = searchTerm.trim().split(/\s+/);
    const formattedWords = words.map((word) => {
      const escapedWord = word.replace(/[\\:'&|!()]/g, '\\$&');

      return `${escapedWord}:*`;
    });

    return formattedWords.join(' | ');
  }
}
