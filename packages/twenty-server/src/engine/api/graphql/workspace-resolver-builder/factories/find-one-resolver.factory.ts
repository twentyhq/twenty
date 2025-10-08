import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';

import { type WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  type FindOneResolverArgs,
  type Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { CommonFindOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-one-query-runner.service';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { GraphqlQueryFindOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-one-resolver.service';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

@Injectable()
export class FindOneResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = RESOLVER_METHOD_NAMES.FIND_ONE;

  constructor(
    private readonly commonFindOneQueryRunnerService: CommonFindOneQueryRunnerService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly graphqlQueryRunnerService: GraphqlQueryFindOneResolverService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<FindOneResolverArgs> {
    const internalContext = context;

    return async (_source, args, _context, info) => {
      const isCommonApiEnabled = await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_COMMON_API_ENABLED,
        internalContext.authContext.workspace?.id as string,
      );

      if (isCommonApiEnabled) {
        try {
          const graphqlQueryParser = new GraphqlQueryParser(
            internalContext.objectMetadataItemWithFieldMaps,
            internalContext.objectMetadataMaps,
          );

          const selectedFieldsResult = graphqlQueryParser.parseSelectedFields(
            internalContext.objectMetadataItemWithFieldMaps,
            graphqlFields(info),
            internalContext.objectMetadataMaps,
          );

          return await this.commonFindOneQueryRunnerService.run({
            args: { ...args, selectedFieldsResult },
            authContext: internalContext.authContext,
            objectMetadataMaps: internalContext.objectMetadataMaps,
            objectMetadataItemWithFieldMaps:
              internalContext.objectMetadataItemWithFieldMaps,
          });
        } catch (error) {
          workspaceQueryRunnerGraphqlApiExceptionHandler(error);
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
        FindOneResolverFactory.methodName,
      );
    };
  }
}
