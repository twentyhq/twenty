import { Injectable } from '@nestjs/common';

import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  Resolver,
  UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { GraphqlQueryRunnerService } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-runner.service';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

@Injectable()
export class UpdateOneResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = 'updateOne' as const;

  constructor(
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly graphqlQueryRunnerService: GraphqlQueryRunnerService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<UpdateOneResolverArgs> {
    const internalContext = context;

    return async (_source, args, context, info) => {
      try {
        const options: WorkspaceQueryRunnerOptions = {
          authContext: internalContext.authContext,
          objectMetadataItem: internalContext.objectMetadataItem,
          info,
          fieldMetadataCollection: internalContext.fieldMetadataCollection,
          objectMetadataCollection: internalContext.objectMetadataCollection,
          objectMetadataMap: internalContext.objectMetadataMap,
          objectMetadataMapItem: internalContext.objectMetadataMapItem,
        };

        const isQueryRunnerTwentyORMEnabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IsQueryRunnerTwentyORMEnabled,
            internalContext.authContext.workspace.id,
          );

        if (isQueryRunnerTwentyORMEnabled) {
          return await this.graphqlQueryRunnerService.updateOne(args, options);
        }

        return await this.workspaceQueryRunnerService.updateOne(args, options);
      } catch (error) {
        workspaceQueryRunnerGraphqlApiExceptionHandler(error);
      }
    };
  }
}
