import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

import { type WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  type FindManyResolverArgs,
  type Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { GraphqlQueryFindManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-many-resolver.service';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

@Injectable()
export class FindManyResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = RESOLVER_METHOD_NAMES.FIND_MANY;

  constructor(
    private readonly commonFindManyQueryRunnerService: CommonFindManyQueryRunnerService,
    private readonly graphqlQueryRunnerService: GraphqlQueryFindManyResolverService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<FindManyResolverArgs> {
    const internalContext = context;

    return async (_source, args, _context, info) => {
      const isCommonApiEnabled = await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_COMMON_API_ENABLED,
        internalContext.authContext.workspace?.id as string,
      );

      if (isCommonApiEnabled) {
        const graphqlQueryParser = new GraphqlQueryParser(
          internalContext.objectMetadataItemWithFieldMaps,
          internalContext.objectMetadataMaps,
        );

        const selectedFieldsResult = graphqlQueryParser.parseSelectedFields(
          internalContext.objectMetadataItemWithFieldMaps,
          graphqlFields(info),
          internalContext.objectMetadataMaps,
        );

        try {
          const { records, aggregatedValues, totalCount, pageInfo } =
            await this.commonFindManyQueryRunnerService.run({
              args: { ...args, selectedFieldsResult },
              authContext: internalContext.authContext,
              objectMetadataMaps: internalContext.objectMetadataMaps,
              objectMetadataItemWithFieldMaps:
                internalContext.objectMetadataItemWithFieldMaps,
            });

          const typeORMObjectRecordsParser =
            new ObjectRecordsToGraphqlConnectionHelper(
              internalContext.objectMetadataMaps,
            );

          return typeORMObjectRecordsParser.createConnection({
            objectRecords: records,
            objectRecordsAggregatedValues: aggregatedValues,
            selectedAggregatedFields: selectedFieldsResult.aggregate,
            objectName:
              internalContext.objectMetadataItemWithFieldMaps.nameSingular,
            take: args.first ?? args.last ?? QUERY_MAX_RECORDS,
            totalCount,
            order: args.orderBy,
            hasNextPage: pageInfo.hasNextPage,
            hasPreviousPage: pageInfo.hasPreviousPage,
          });
        } catch (error) {
          return workspaceQueryRunnerGraphqlApiExceptionHandler(error);
        }
      }

      return await this.graphqlQueryRunnerService.execute(
        args,
        {
          authContext: internalContext.authContext,
          info,
          objectMetadataMaps: internalContext.objectMetadataMaps,
          objectMetadataItemWithFieldMaps:
            internalContext.objectMetadataItemWithFieldMaps,
        },
        FindManyResolverFactory.methodName,
      );
    };
  }
}
