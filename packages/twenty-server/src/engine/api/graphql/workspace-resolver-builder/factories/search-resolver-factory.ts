import { Injectable } from '@nestjs/common';

import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  Resolver,
  SearchResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { GraphqlQuerySearchResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-search-resolver.service';

@Injectable()
export class SearchResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = 'search' as const;

  constructor(
    private readonly graphqlQueryRunnerService: GraphqlQuerySearchResolverService,
  ) {}

  create(context: WorkspaceSchemaBuilderContext): Resolver<SearchResolverArgs> {
    const internalContext = context;

    return async (_source, args, _context, info) => {
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
        SearchResolverFactory.methodName,
      );
    };
  }
}
