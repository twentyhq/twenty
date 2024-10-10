import { Injectable } from '@nestjs/common';

import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  DestroyManyResolverArgs,
  Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { GraphqlQueryRunnerService } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-runner.service';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';

@Injectable()
export class DestroyManyResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = 'destroyMany' as const;

  constructor(
    private readonly graphqlQueryRunnerService: GraphqlQueryRunnerService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<DestroyManyResolverArgs> {
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

        return await this.graphqlQueryRunnerService.destroyMany(args, options);
      } catch (error) {
        workspaceQueryRunnerGraphqlApiExceptionHandler(error, internalContext);
      }
    };
  }
}
