import { Injectable } from '@nestjs/common';

import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  DestroyOneResolverArgs,
  Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { GraphqlQueryDestroyOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-destroy-one-resolver.service';

@Injectable()
export class DestroyOneResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = 'destroyOne' as const;

  constructor(
    private readonly graphQLQueryRunnerService: GraphqlQueryDestroyOneResolverService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<DestroyOneResolverArgs> {
    const internalContext = context;

    return async (_source, args, context, info) => {
      const options: WorkspaceQueryRunnerOptions = {
        authContext: internalContext.authContext,
        info,
        objectMetadataMaps: internalContext.objectMetadataMaps,
        objectMetadataItemWithFieldMaps:
          internalContext.objectMetadataItemWithFieldMaps,
      };

      return await this.graphQLQueryRunnerService.execute(
        args,
        options,
        DestroyOneResolverFactory.methodName,
      );
    };
  }
}
