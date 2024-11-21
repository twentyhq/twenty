import { Injectable } from '@nestjs/common';

import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  Resolver,
  RestoreOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { GraphqlQueryRestoreOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-restore-one-resolver.service';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';

@Injectable()
export class RestoreOneResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = 'restoreOne' as const;

  constructor(
    private readonly graphqlQueryRunnerService: GraphqlQueryRestoreOneResolverService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<RestoreOneResolverArgs> {
    const internalContext = context;

    return async (_source, args, context, info) => {
      try {
        const options: WorkspaceQueryRunnerOptions = {
          authContext: internalContext.authContext,
          info,
          objectMetadataMaps: internalContext.objectMetadataMaps,
          objectMetadataItemWithFieldMaps:
            internalContext.objectMetadataItemWithFieldMaps,
        };

        return await this.graphqlQueryRunnerService.execute(
          args,
          options,
          RestoreOneResolverFactory.methodName,
        );
      } catch (error) {
        workspaceQueryRunnerGraphqlApiExceptionHandler(error, internalContext);
      }
    };
  }
}
