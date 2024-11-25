import { Injectable } from '@nestjs/common';

import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  DeleteManyResolverArgs,
  Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { GraphqlQueryDeleteManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-delete-many-resolver.service';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';

@Injectable()
export class DeleteManyResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = 'deleteMany' as const;

  constructor(
    private readonly graphqlQueryRunnerService: GraphqlQueryDeleteManyResolverService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<DeleteManyResolverArgs> {
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
          DeleteManyResolverFactory.methodName,
        );
      } catch (error) {
        workspaceQueryRunnerGraphqlApiExceptionHandler(error, internalContext);
      }
    };
  }
}
